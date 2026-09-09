import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Check, CheckStatus, CheckDirection } from '../../entities/check.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Customer } from '../../entities/customer.entity';
import { CreateCheckDto } from './dto/create-check.dto';

@Injectable()
export class ChecksService {
  constructor(
    @InjectRepository(Check) private readonly checkRepo: Repository<Check>,
    @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
  ) {}

  findAll() {
    return this.checkRepo.find({
      relations: ['vendor', 'customer', 'bankAccount'],
      order: { dueDate: 'ASC' },
    });
  }

  async findOneOrFail(id: number) {
    const check = await this.checkRepo.findOne({
      where: { id },
      relations: ['vendor', 'customer', 'bankAccount'],
    });
    if (!check) throw new NotFoundException('الشيك غير موجود');
    return check;
  }

  create(dto: CreateCheckDto) {
    const check = this.checkRepo.create({
      checkNumber: dto.checkNumber,
      direction: dto.direction,
      vendor: dto.vendorId ? ({ id: dto.vendorId } as any) : undefined,
      customer: dto.customerId ? ({ id: dto.customerId } as any) : undefined,
      bankAccount: dto.bankAccountId ? ({ id: dto.bankAccountId } as any) : undefined,
      bankName: dto.bankName,
      dueDate: dto.dueDate,
      amount: dto.amount,
      notes: dto.notes,
      status: CheckStatus.PENDING,
    });
    return this.checkRepo.save(check);
  }

  async updateStatus(id: number, status: CheckStatus) {
    const check = await this.findOneOrFail(id);
    check.status = status;
    return this.checkRepo.save(check);
  }

  async remove(id: number) {
    const check = await this.findOneOrFail(id);
    await this.checkRepo.remove(check);
  }

  // إجماليات سريعة تُستخدم في الداش بورد: شيكات مستحقة قريبًا + شيكات متأخرة
  async getDashboardTotals() {
    const today = new Date().toISOString().slice(0, 10);

    const overdueRow = await this.checkRepo
      .createQueryBuilder('c')
      .where('c.status = :status', { status: CheckStatus.PENDING })
      .andWhere('c.dueDate < :today', { today })
      .select('COALESCE(SUM(c.amount), 0)', 'total')
      .addSelect('COUNT(*)', 'count')
      .getRawOne();

    const upcomingRow = await this.checkRepo
      .createQueryBuilder('c')
      .where('c.status = :status', { status: CheckStatus.PENDING })
      .andWhere('c.dueDate >= :today', { today })
      .select('COALESCE(SUM(c.amount), 0)', 'total')
      .addSelect('COUNT(*)', 'count')
      .getRawOne();

    return {
      overdueChecksAmount: Number(overdueRow?.total || 0),
      overdueChecksCount: Number(overdueRow?.count || 0),
      upcomingChecksAmount: Number(upcomingRow?.total || 0),
      upcomingChecksCount: Number(upcomingRow?.count || 0),
    };
  }

  // ============================================================
  // استيراد الشيكات من إكسيل - نفس أسلوب استيراد مستحقات الموردين/العملاء
  // الأعمدة المطلوبة بالظبط:
  // رقم الشيك | النوع (وارد/صادر) | كود | تاريخ الاستحقاق | المبلغ | اسم البنك | ملاحظات
  // "النوع": اكتب "وارد" لو الشيك جاي من عميل هيتحصل، أو "صادر" لو شيك هتصرفه لمورد
  // "كود": كود العميل (لو وارد) أو كود المورد (لو صادر) - لازم يكون موجود في التكويد الأساسي
  // ============================================================
  async importChecksFromExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rawRows.length === 0) {
      throw new BadRequestException('الملف فاضي أو الشيت الأول مفيهوش بيانات');
    }

    const vendors = await this.vendorRepo.find();
    const customers = await this.customerRepo.find();
    const vendorByCode = new Map(vendors.map((v) => [v.code, v]));
    const customerByCode = new Map(customers.map((c) => [c.code, c]));

    const notFoundCodes: string[] = [];
    const toInsert: Check[] = [];

    rawRows.forEach((row, index) => {
      const checkNumber = String(row['رقم الشيك'] ?? row['checkNumber'] ?? '').trim();
      const typeRaw = String(row['النوع'] ?? row['direction'] ?? '').trim();
      const code = String(row['كود'] ?? row['code'] ?? '').trim();
      const dueDateRaw = row['تاريخ الاستحقاق'] ?? row['dueDate'] ?? '';
      const amount = Number(row['المبلغ'] ?? row['amount'] ?? 0);
      const bankName = String(row['اسم البنك'] ?? row['bankName'] ?? '').trim();
      const notes = String(row['ملاحظات'] ?? row['notes'] ?? '').trim();

      if (!checkNumber) {
        throw new BadRequestException(`الصف رقم ${index + 2} مفيهوش رقم شيك`);
      }
      if (!amount || amount <= 0) {
        throw new BadRequestException(`الصف رقم ${index + 2} (شيك ${checkNumber}) المبلغ غلط أو صفر`);
      }
      const dueDate = this.normalizeExcelDate(dueDateRaw);
      if (!dueDate) {
        throw new BadRequestException(`الصف رقم ${index + 2} (شيك ${checkNumber}) تاريخ الاستحقاق غلط أو فاضي`);
      }

      const isReceivable = typeRaw === 'وارد' || typeRaw.toLowerCase() === 'receivable';
      const isPayable = typeRaw === 'صادر' || typeRaw.toLowerCase() === 'payable';
      if (!isReceivable && !isPayable) {
        throw new BadRequestException(
          `الصف رقم ${index + 2} (شيك ${checkNumber}): عمود "النوع" لازم يكون "وارد" أو "صادر" بالظبط`,
        );
      }

      let vendor: Vendor | undefined;
      let customer: Customer | undefined;
      if (isReceivable) {
        customer = customerByCode.get(code);
        if (!customer) notFoundCodes.push(code);
      } else {
        vendor = vendorByCode.get(code);
        if (!vendor) notFoundCodes.push(code);
      }

      toInsert.push(
        this.checkRepo.create({
          checkNumber,
          direction: isReceivable ? CheckDirection.RECEIVABLE : CheckDirection.PAYABLE,
          vendor,
          customer,
          bankName: bankName || undefined,
          dueDate,
          amount,
          notes: notes || undefined,
          status: CheckStatus.PENDING,
        }),
      );
    });

    if (toInsert.length === 0) {
      throw new BadRequestException('مفيش ولا صف اتقرأ صح من الملف');
    }

    await this.checkRepo.save(toInsert);

    return {
      imported: toInsert.length,
      skippedCodesNotFound: [...new Set(notFoundCodes)],
    };
  }

  private normalizeExcelDate(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (!parsed) return undefined;
      return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
    }
    const asDate = new Date(value);
    if (isNaN(asDate.getTime())) return undefined;
    return asDate.toISOString().slice(0, 10);
  }
}
