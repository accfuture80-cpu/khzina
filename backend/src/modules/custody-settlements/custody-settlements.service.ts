import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  CustodySettlement,
  SettlementStatus,
} from '../../entities/custody-settlement.entity';
import { CustodySettlementLine } from '../../entities/custody-settlement-line.entity';
import { VoucherLine, VoucherLineType } from '../../entities/voucher-line.entity';
import { RoleCode } from '../../entities/role.entity';
import { FULL_ACCESS_ROLES } from '../auth/guards/roles.guard';
import { SerialNumberService } from '../common/serial-number.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { CurrentUserPayload } from '../vouchers/vouchers.service';

@Injectable()
export class CustodySettlementsService {
  constructor(
    @InjectRepository(CustodySettlement)
    private readonly settlementRepo: Repository<CustodySettlement>,
    @InjectRepository(VoucherLine)
    private readonly voucherLineRepo: Repository<VoucherLine>,
    private readonly dataSource: DataSource,
    private readonly serialNumberService: SerialNumberService,
  ) {}

  async create(dto: CreateSettlementDto, currentUser: CurrentUserPayload) {
    const custodyLine = await this.voucherLineRepo.findOne({
      where: { id: dto.custodyVoucherLineId },
    });

    if (!custodyLine || custodyLine.lineType !== VoucherLineType.CUSTODY_ADVANCE) {
      throw new BadRequestException('البند المحدد مش عهدة/سلفة صالحة للتسوية');
    }

    const totalNewLines = dto.lines.reduce((sum, l) => sum + l.amount, 0);

    // التأكد إن إجمالي التسويات (شاملة الحالية) ميتعداش قيمة العهدة الأصلية
    const alreadySettled = await this.settlementRepo
      .createQueryBuilder('s')
      .leftJoin('s.lines', 'l')
      .where('s.custodyVoucherLineId = :lineId', { lineId: custodyLine.id })
      .select('COALESCE(SUM(l.amount), 0)', 'total')
      .getRawOne();

    const remaining = Number(custodyLine.amount) - Number(alreadySettled?.total || 0);
    if (totalNewLines > remaining) {
      throw new BadRequestException(
        `المبلغ أكبر من المتبقي في العهدة (المتبقي: ${remaining})`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const serialNumber = await this.serialNumberService.generate(
        manager,
        'settlement',
        'SET',
      );

      const settlement = manager.create(CustodySettlement, {
        serialNumber,
        custodyVoucherLine: { id: custodyLine.id } as any,
        employee: { id: dto.employeeId } as any,
        settlementDate: dto.settlementDate,
        status: SettlementStatus.DRAFT,
        createdBy: { id: currentUser.userId } as any,
        lines: dto.lines.map((l) =>
          manager.create(CustodySettlementLine, {
            mainCategory: l.mainCategoryId ? ({ id: l.mainCategoryId } as any) : null,
            subCategory: l.subCategoryId ? ({ id: l.subCategoryId } as any) : null,
            costCenter: l.costCenterId ? ({ id: l.costCenterId } as any) : null,
            amount: l.amount,
            description: l.description,
          }),
        ),
      });

      return manager.save(settlement);
    });
  }

  // بنود العهدة/السلفة (من الأذون المصروفة) اللي لسه فيها مبلغ متبقي يستاهل تسوية
  async getAvailableCustodyLines() {
    const lines = await this.voucherLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.voucher', 'voucher')
      .innerJoin('line.employee', 'employee')
      .where('line.lineType = :lineType', { lineType: VoucherLineType.CUSTODY_ADVANCE })
      .andWhere('voucher.status = :status', { status: 'disbursed' })
      .andWhere('voucher.isDeleted = false')
      .select([
        'line.id AS "lineId"',
        'line.amount AS amount',
        'employee.id AS "employeeId"',
        'employee.name AS "employeeName"',
        'voucher.serialNumber AS "serialNumber"',
        'voucher.voucherDate AS "voucherDate"',
      ])
      .getRawMany();

    if (lines.length === 0) return [];

    const settledRows = await this.settlementRepo
      .createQueryBuilder('s')
      .leftJoin('s.lines', 'l')
      .where('s.custodyVoucherLineId IN (:...ids)', { ids: lines.map((l) => l.lineId) })
      .select('s.custodyVoucherLineId', 'lineId')
      .addSelect('COALESCE(SUM(l.amount), 0)', 'settled')
      .groupBy('s.custodyVoucherLineId')
      .getRawMany();

    const settledMap = new Map(settledRows.map((r) => [r.lineId, Number(r.settled)]));

    return lines
      .map((l) => ({
        lineId: l.lineId,
        amount: Number(l.amount),
        settled: settledMap.get(l.lineId) ?? 0,
        remaining: Number(l.amount) - (settledMap.get(l.lineId) ?? 0),
        employeeId: l.employeeId,
        employeeName: l.employeeName,
        serialNumber: l.serialNumber,
        voucherDate: l.voucherDate,
      }))
      .filter((l) => l.remaining > 0);
  }

  // اعتماد التسوية - المدير المالي (بنفس منطق مراجعة/اعتماد باقي الأذون)
  async approve(id: number, currentUser: CurrentUserPayload) {
    const hasFullAccess = currentUser.roles.some((r) => FULL_ACCESS_ROLES.includes(r));
    if (!hasFullAccess && !currentUser.roles.includes(RoleCode.FINANCIAL_MANAGER)) {
      throw new ForbiddenException('اعتماد التسوية من صلاحية المدير المالي فقط');
    }

    const settlement = await this.findOneOrFail(id);
    settlement.status = SettlementStatus.APPROVED;
    return this.settlementRepo.save(settlement);
  }

  async findAll() {
    return this.settlementRepo.find({
      relations: ['employee', 'custodyVoucherLine', 'lines', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneOrFail(id: number): Promise<CustodySettlement> {
    const settlement = await this.settlementRepo.findOne({
      where: { id },
      relations: [
        'employee',
        'custodyVoucherLine',
        'lines',
        'lines.mainCategory',
        'lines.subCategory',
        'lines.costCenter',
        'createdBy',
      ],
    });
    if (!settlement) throw new NotFoundException('التسوية غير موجودة');
    return settlement;
  }
}
