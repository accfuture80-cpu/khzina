import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { VendorDue, DueStatus } from '../../entities/vendor-due.entity';
import { CustomerDue } from '../../entities/customer-due.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Customer } from '../../entities/customer.entity';

interface ImportRow {
  code: string; // كود المورد/العميل - لازم يكون موجود عندنا في التكويد الأساسي
  invoiceNumber?: string;
  dueDate?: string;
  amount: number;
  description?: string;
}

@Injectable()
export class DuesService {
  constructor(
    @InjectRepository(VendorDue) private readonly vendorDueRepo: Repository<VendorDue>,
    @InjectRepository(CustomerDue) private readonly customerDueRepo: Repository<CustomerDue>,
    @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // قراءة ملف الإكسيل - نفس المنطق للموردين والعملاء
  // الأعمدة المتوقعة: كود | رقم الفاتورة | تاريخ الاستحقاق | المبلغ | بيان
  // ============================================================
  private parseExcelFile(buffer: Buffer): ImportRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rawRows.length === 0) {
      throw new BadRequestException('الملف فاضي أو الشيت الأول مفيهوش بيانات');
    }

    return rawRows.map((row, index) => {
      // بندعم أكتر من اسم عمود محتمل عشان أي فورمات تصدير من Next
      const code = String(row['كود'] ?? row['الكود'] ?? row['code'] ?? '').trim();
      const amount = Number(row['المبلغ'] ?? row['amount'] ?? 0);
      const invoiceNumber = String(row['رقم الفاتورة'] ?? row['invoiceNumber'] ?? '').trim();
      const dueDateRaw = row['تاريخ الاستحقاق'] ?? row['dueDate'] ?? '';
      const description = String(row['بيان'] ?? row['description'] ?? '').trim();

      if (!code) {
        throw new BadRequestException(`الصف رقم ${index + 2} في الإكسيل مفيهوش كود`);
      }
      if (!amount || amount <= 0) {
        throw new BadRequestException(`الصف رقم ${index + 2} (كود ${code}) المبلغ فيه غلط أو صفر`);
      }

      return {
        code,
        invoiceNumber: invoiceNumber || undefined,
        dueDate: this.normalizeExcelDate(dueDateRaw),
        amount,
        description: description || undefined,
      };
    });
  }

  // إكسيل بيخزن التواريخ كرقم أحيانًا - بنحولها لصيغة YYYY-MM-DD
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

  // ============================================================
  // استيراد مستحقات الموردين - بيمسح كل المستحقات "لسه معلقة" القديمة
  // ويحط بدالها المحتوى الجديد بالكامل (زي ما بيحصل مع تصدير يومي لأرصدة)
  // ============================================================
  async importVendorDues(buffer: Buffer) {
    const rows = this.parseExcelFile(buffer);
    const batchId = `V-${Date.now()}`;

    const vendors = await this.vendorRepo.find();
    const vendorByCode = new Map(vendors.map((v) => [v.code, v]));

    const notFoundCodes: string[] = [];
    const toInsert: VendorDue[] = [];

    for (const row of rows) {
      const vendor = vendorByCode.get(row.code);
      if (!vendor) {
        notFoundCodes.push(row.code);
        continue;
      }
      toInsert.push(
        this.vendorDueRepo.create({
          vendor,
          invoiceNumber: row.invoiceNumber,
          dueDate: row.dueDate,
          amount: row.amount,
          description: row.description,
          status: DueStatus.PENDING,
          importBatch: batchId,
        }),
      );
    }

    if (toInsert.length === 0) {
      throw new BadRequestException(
        `مفيش ولا صف اتطابق مع أكواد موردين موجودة عندنا. تأكد إن عمود "كود" في الإكسيل مطابق لكود المورد في شاشة تكويد الموردين.`,
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(VendorDue, { status: DueStatus.PENDING });
      await manager.save(toInsert);
    });

    return {
      imported: toInsert.length,
      skipped: notFoundCodes.length,
      notFoundCodes: [...new Set(notFoundCodes)],
    };
  }

  async importCustomerDues(buffer: Buffer) {
    const rows = this.parseExcelFile(buffer);
    const batchId = `C-${Date.now()}`;

    const customers = await this.customerRepo.find();
    const customerByCode = new Map(customers.map((c) => [c.code, c]));

    const notFoundCodes: string[] = [];
    const toInsert: CustomerDue[] = [];

    for (const row of rows) {
      const customer = customerByCode.get(row.code);
      if (!customer) {
        notFoundCodes.push(row.code);
        continue;
      }
      toInsert.push(
        this.customerDueRepo.create({
          customer,
          invoiceNumber: row.invoiceNumber,
          dueDate: row.dueDate,
          amount: row.amount,
          description: row.description,
          status: DueStatus.PENDING,
          importBatch: batchId,
        }),
      );
    }

    if (toInsert.length === 0) {
      throw new BadRequestException(
        `مفيش ولا صف اتطابق مع أكواد عملاء موجودة عندنا. تأكد إن عمود "كود" في الإكسيل مطابق لكود العميل في شاشة تكويد العملاء.`,
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(CustomerDue, { status: DueStatus.PENDING });
      await manager.save(toInsert);
    });

    return {
      imported: toInsert.length,
      skipped: notFoundCodes.length,
      notFoundCodes: [...new Set(notFoundCodes)],
    };
  }

  // ============================================================
  // استعلامات القراءة
  // ============================================================
  findAllVendorDues() {
    return this.vendorDueRepo.find({
      relations: ['vendor'],
      order: { dueDate: 'ASC' },
    });
  }

  findAllCustomerDues() {
    return this.customerDueRepo.find({
      relations: ['customer'],
      order: { dueDate: 'ASC' },
    });
  }

  async markVendorDuePaid(id: number) {
    const due = await this.vendorDueRepo.findOne({ where: { id } });
    if (!due) throw new NotFoundException('المستحق غير موجود');
    due.status = DueStatus.PAID;
    return this.vendorDueRepo.save(due);
  }

  async markCustomerDuePaid(id: number) {
    const due = await this.customerDueRepo.findOne({ where: { id } });
    if (!due) throw new NotFoundException('المستحق غير موجود');
    due.status = DueStatus.PAID;
    return this.customerDueRepo.save(due);
  }

  // إجماليات سريعة تُستخدم في الداش بورد
  async getDashboardTotals() {
    const vendorPending = await this.vendorDueRepo
      .createQueryBuilder('d')
      .where('d.status = :status', { status: DueStatus.PENDING })
      .select('COALESCE(SUM(d.amount), 0)', 'total')
      .addSelect('COUNT(*)', 'count')
      .getRawOne();

    const customerPending = await this.customerDueRepo
      .createQueryBuilder('d')
      .where('d.status = :status', { status: DueStatus.PENDING })
      .select('COALESCE(SUM(d.amount), 0)', 'total')
      .addSelect('COUNT(*)', 'count')
      .getRawOne();

    return {
      totalVendorDues: Number(vendorPending?.total || 0),
      vendorDuesCount: Number(vendorPending?.count || 0),
      totalCustomerDues: Number(customerPending?.total || 0),
      customerDuesCount: Number(customerPending?.count || 0),
    };
  }
}
