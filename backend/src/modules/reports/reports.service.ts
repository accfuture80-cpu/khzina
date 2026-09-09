import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreasuryVoucher, VoucherStatus, VoucherType } from '../../entities/treasury-voucher.entity';
import { TreasuryTransfer, TransferStatus, AccountKind } from '../../entities/treasury-transfer.entity';
import { AccountBalance } from '../../entities/account-balance.entity';
import { VoucherLine } from '../../entities/voucher-line.entity';
import { CustodySettlement } from '../../entities/custody-settlement.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(TreasuryVoucher)
    private readonly voucherRepo: Repository<TreasuryVoucher>,
    @InjectRepository(TreasuryTransfer)
    private readonly transferRepo: Repository<TreasuryTransfer>,
    @InjectRepository(AccountBalance)
    private readonly balanceRepo: Repository<AccountBalance>,
    @InjectRepository(VoucherLine)
    private readonly voucherLineRepo: Repository<VoucherLine>,
    @InjectRepository(CustodySettlement)
    private readonly settlementRepo: Repository<CustodySettlement>,
  ) {}

  // ============================================================
  // كشف حساب شامل: إجمالي الإيرادات + تمويل الخزينة + إجمالي الصرف
  // + التحويلات (داخل/خارج) + الرصيد الحالي، وتفصيل كل حركة
  // لو اتبعت fromDate/toDate: بيتحسب "رصيد سابق" (الرصيد قبل fromDate)
  // وبيترشّح كل التفصيل على الفترة بس، وبيترجع تجميع بالبند وتجميع بالإذن
  // ============================================================
  async getAccountStatement(
    accountType: AccountKind,
    accountId: number,
    fromDate?: string,
    toDate?: string,
  ) {
    // مهم: لازم نستخدم اسم العلاقة (relation) الحقيقي زي ما هو معرّف في الـ Entity
    // (voucher.wallet مش voucher.walletId) عشان TypeORM يقدر يترجمها لعمود الـ FK الصحيح
    const voucherAccountColumn =
      accountType === AccountKind.BANK
        ? 'voucher.bankAccount'
        : accountType === AccountKind.WALLET
          ? 'voucher.wallet'
          : 'voucher.branch';

    // رصيد سابق: أثر كل الأذون والتحويلات اللي تاريخها قبل بداية الفترة المطلوبة
    let previousBalance = 0;
    if (fromDate) {
      const priorVouchers = await this.voucherRepo
        .createQueryBuilder('voucher')
        .where(`${voucherAccountColumn} = :accountId`, { accountId })
        .andWhere('voucher.status = :status', { status: VoucherStatus.DISBURSED })
        .andWhere('voucher.isDeleted = false')
        .andWhere('voucher.voucherDate < :fromDate', { fromDate })
        .select(['voucher.voucherType AS "voucherType"', 'voucher.totalAmount AS "totalAmount"'])
        .getRawMany();

      for (const v of priorVouchers) {
        previousBalance += (v.voucherType === 'revenue' ? 1 : -1) * Number(v.totalAmount);
      }

      const priorTransfersOut = await this.transferRepo
        .createQueryBuilder('t')
        .where('t.fromType = :accountType', { accountType })
        .andWhere('t.fromId = :accountId', { accountId })
        .andWhere('t.status = :status', { status: TransferStatus.EXECUTED })
        .andWhere('t.transferDate < :fromDate', { fromDate })
        .select('COALESCE(SUM(t.amount + t.commissionAmount), 0)', 'total')
        .getRawOne();

      const priorTransfersIn = await this.transferRepo
        .createQueryBuilder('t')
        .where('t.toType = :accountType', { accountType })
        .andWhere('t.toId = :accountId', { accountId })
        .andWhere('t.status = :status', { status: TransferStatus.EXECUTED })
        .andWhere('t.transferDate < :fromDate', { fromDate })
        .select('COALESCE(SUM(t.amount), 0)', 'total')
        .getRawOne();

      previousBalance += Number(priorTransfersIn?.total || 0) - Number(priorTransfersOut?.total || 0);
    }

    let query = this.voucherRepo
      .createQueryBuilder('voucher')
      .innerJoin('voucher.lines', 'line')
      .leftJoin('line.mainCategory', 'mainCategory')
      .leftJoin('line.subCategory', 'subCategory')
      .leftJoin('line.costCenter', 'costCenter')
      .where(`${voucherAccountColumn} = :accountId`, { accountId })
      .andWhere('voucher.status = :status', { status: VoucherStatus.DISBURSED })
      .andWhere('voucher.isDeleted = false');

    if (fromDate) query = query.andWhere('voucher.voucherDate >= :fromDate', { fromDate });
    if (toDate) query = query.andWhere('voucher.voucherDate <= :toDate', { toDate });

    const rawLines = await query
      .select([
        'voucher.id AS "voucherId"',
        'voucher.serialNumber AS "serialNumber"',
        'voucher.voucherDate AS "voucherDate"',
        'voucher.voucherType AS "voucherType"',
        'line.lineType AS "lineType"',
        'line.amount AS amount',
        'line.description AS description',
        'mainCategory.name AS "mainCategoryName"',
        'subCategory.name AS "subCategoryName"',
        'costCenter.name AS "costCenterName"',
      ])
      .orderBy('voucher.voucherDate', 'ASC')
      .getRawMany();

    let totalRevenue = 0;
    let treasuryFunding = 0;
    let totalExpense = 0;

    for (const l of rawLines) {
      const amount = Number(l.amount);
      if (l.lineType === 'treasury_funding') {
        treasuryFunding += amount;
      } else if (l.voucherType === 'revenue') {
        totalRevenue += amount;
      } else if (l.voucherType === 'expense') {
        totalExpense += amount;
      }
    }

    const transfersOutRow = await this.transferRepo
      .createQueryBuilder('t')
      .where('t.fromType = :accountType', { accountType })
      .andWhere('t.fromId = :accountId', { accountId })
      .andWhere('t.status = :status', { status: TransferStatus.EXECUTED })
      .select('COALESCE(SUM(t.amount + t.commissionAmount), 0)', 'total')
      .getRawOne();

    const transfersInRow = await this.transferRepo
      .createQueryBuilder('t')
      .where('t.toType = :accountType', { accountType })
      .andWhere('t.toId = :accountId', { accountId })
      .andWhere('t.status = :status', { status: TransferStatus.EXECUTED })
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .getRawOne();

    const balance = await this.balanceRepo.findOne({ where: { accountType, accountId } });

    // إجمالي أثر الفترة على الرصيد (إيراد + تمويل - مصروف)، عشان "الرصيد الختامي" لو فيه فلتر تاريخ
    const periodNet = totalRevenue + treasuryFunding - totalExpense;
    const closingBalance = fromDate ? previousBalance + periodNet : Number(balance?.currentBalance || 0);

    // تجميع بالبند (المصروف الرئيسي/الفرعي/مركز التكلفة) - لتقرير "تفصيلي بالبند"
    const categoryMap = new Map<
      string,
      { mainCategory: string; subCategory: string; costCenter: string; amount: number; count: number }
    >();
    for (const l of rawLines) {
      const mainCategory = l.mainCategoryName || 'بدون بند';
      const subCategory = l.subCategoryName || '-';
      const costCenter = l.costCenterName || '-';
      const key = `${mainCategory}|${subCategory}|${costCenter}`;
      const entry = categoryMap.get(key) ?? { mainCategory, subCategory, costCenter, amount: 0, count: 0 };
      entry.amount += Number(l.amount);
      entry.count += 1;
      categoryMap.set(key, entry);
    }
    const byCategory = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);

    // تجميع بالإذن (إجمالي كل إذن لوحده) - لتقرير "إجمالي الأذون"
    const voucherMap = new Map<
      number,
      { voucherId: number; serialNumber: string; date: string; voucherType: string; amount: number }
    >();
    for (const l of rawLines) {
      const entry = voucherMap.get(l.voucherId) ?? {
        voucherId: l.voucherId,
        serialNumber: l.serialNumber,
        date: l.voucherDate,
        voucherType: l.voucherType,
        amount: 0,
      };
      entry.amount += Number(l.amount);
      voucherMap.set(l.voucherId, entry);
    }
    const byVoucher = Array.from(voucherMap.values());

    return {
      summary: {
        previousBalance,
        totalRevenue,
        treasuryFunding,
        totalExpense,
        transfersIn: Number(transfersInRow?.total || 0),
        transfersOut: Number(transfersOutRow?.total || 0),
        periodNet,
        closingBalance,
        currentBalance: Number(balance?.currentBalance || 0),
      },
      // تفصيلي: كل حركة لوحدها | بالبند: مجمّع حسب المصروف الرئيسي/الفرعي/مركز التكلفة | بالإذن: مجمّع حسب الإذن
      transactions: rawLines.map((l) => ({
        voucherId: l.voucherId,
        serialNumber: l.serialNumber,
        date: l.voucherDate,
        voucherType: l.voucherType,
        lineType: l.lineType,
        amount: Number(l.amount),
        description: l.description,
        mainCategory: l.mainCategoryName,
        subCategory: l.subCategoryName,
        costCenter: l.costCenterName,
      })),
      byCategory,
      byVoucher,
    };
  }

  // ============================================================
  // تقرير الموردين: إجمالي اللي اتسدد لكل مورد (من الأذون المصروفة فعليًا بس)
  // ملحوظة مهمة: النظام مفيهوش فواتير/أرصدة افتتاحية للموردين، فالتقرير ده
  // بيوريك "المسدد فعليًا" بس - مش "المتبقي/المستحق" لأن مفيش مصدر بيانات
  // لقيمة الفواتير المستحقة أصلًا يتقارن بيه
  // ============================================================
  async getVendorsStatement(fromDate?: string, toDate?: string) {
    const qb = this.voucherLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.voucher', 'voucher')
      .innerJoin('line.vendor', 'vendor')
      .where('line.lineType = :lineType', { lineType: 'vendor_payment' })
      .andWhere('voucher.status = :status', { status: VoucherStatus.DISBURSED })
      .andWhere('voucher.isDeleted = false')
      .select('vendor.id', 'vendorId')
      .addSelect('vendor.name', 'vendorName')
      .addSelect('vendor.code', 'vendorCode')
      .addSelect('COALESCE(SUM(line.amount), 0)', 'totalPaid')
      .addSelect('COUNT(DISTINCT voucher.id)', 'vouchersCount')
      .addSelect('MAX(voucher.voucherDate)', 'lastPaymentDate')
      .groupBy('vendor.id')
      .addGroupBy('vendor.name')
      .addGroupBy('vendor.code')
      .orderBy('"totalPaid"', 'DESC');

    if (fromDate) qb.andWhere('voucher.voucherDate >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('voucher.voucherDate <= :toDate', { toDate });

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      vendorId: r.vendorId,
      vendorName: r.vendorName,
      vendorCode: r.vendorCode,
      totalPaid: Number(r.totalPaid),
      vouchersCount: Number(r.vouchersCount),
      lastPaymentDate: r.lastPaymentDate,
    }));
  }

  // ============================================================
  // تقرير العملاء: إجمالي اللي اتحصّل من كل عميل (تحصيل + إيراد آخر مربوط بعميل)
  // نفس الملحوظة: "المحصّل فعليًا" بس، مش "المتبقي/المستحق"
  // ============================================================
  async getCustomersStatement(fromDate?: string, toDate?: string) {
    const qb = this.voucherLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.voucher', 'voucher')
      .innerJoin('line.customer', 'customer')
      .where('line.lineType IN (:...lineTypes)', {
        lineTypes: ['customer_collection', 'other_revenue'],
      })
      .andWhere('voucher.status = :status', { status: VoucherStatus.DISBURSED })
      .andWhere('voucher.isDeleted = false')
      .select('customer.id', 'customerId')
      .addSelect('customer.name', 'customerName')
      .addSelect('customer.code', 'customerCode')
      .addSelect('COALESCE(SUM(line.amount), 0)', 'totalCollected')
      .addSelect('COUNT(DISTINCT voucher.id)', 'vouchersCount')
      .addSelect('MAX(voucher.voucherDate)', 'lastCollectionDate')
      .groupBy('customer.id')
      .addGroupBy('customer.name')
      .addGroupBy('customer.code')
      .orderBy('"totalCollected"', 'DESC');

    if (fromDate) qb.andWhere('voucher.voucherDate >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('voucher.voucherDate <= :toDate', { toDate });

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      customerId: r.customerId,
      customerName: r.customerName,
      customerCode: r.customerCode,
      totalCollected: Number(r.totalCollected),
      vouchersCount: Number(r.vouchersCount),
      lastCollectionDate: r.lastCollectionDate,
    }));
  }

  // ============================================================
  // تقرير تسوية العهدة: كل تسوية معتمدة لكل موظف، مع إجمالي ما اتسوّى
  // ملحوظة تقنية: بنعمل استعلامين منفصلين (مش JOIN واحد) عشان لو الـ
  // JOIN بين lines و custodyVoucherLine مع بعض بيكرر قيمة العهدة الأصلية
  // بعدد بنود التسوية (Fan-out) ويطلع رقم غلط
  // ============================================================
  async getCustodySettlementsStatement(fromDate?: string, toDate?: string) {
    // إجمالي المسوّى فعليًا لكل موظف (من بنود التسويات المعتمدة)
    const settledQb = this.settlementRepo
      .createQueryBuilder('settlement')
      .innerJoin('settlement.employee', 'employee')
      .innerJoin('settlement.lines', 'lines')
      .where('settlement.status = :status', { status: 'approved' })
      .select('employee.id', 'employeeId')
      .addSelect('employee.name', 'employeeName')
      .addSelect('employee.code', 'employeeCode')
      .addSelect('COUNT(DISTINCT settlement.id)', 'settlementsCount')
      .addSelect('COALESCE(SUM(lines.amount), 0)', 'totalSettled')
      .addSelect('MAX(settlement.settlementDate)', 'lastSettlementDate')
      .groupBy('employee.id')
      .addGroupBy('employee.name')
      .addGroupBy('employee.code');

    if (fromDate) settledQb.andWhere('settlement.settlementDate >= :fromDate', { fromDate });
    if (toDate) settledQb.andWhere('settlement.settlementDate <= :toDate', { toDate });

    const settledRows = await settledQb.getRawMany();

    // إجمالي قيمة العهد الأصلية اللي اتسوّت (بدون تكرار - كل تسوية ليها عهدة واحدة بس)
    const grantedQb = this.settlementRepo
      .createQueryBuilder('settlement')
      .innerJoin('settlement.employee', 'employee')
      .innerJoin('settlement.custodyVoucherLine', 'custodyLine')
      .where('settlement.status = :status', { status: 'approved' })
      .select('employee.id', 'employeeId')
      .addSelect('COALESCE(SUM(custodyLine.amount), 0)', 'totalCustodyGranted')
      .groupBy('employee.id');

    if (fromDate) grantedQb.andWhere('settlement.settlementDate >= :fromDate', { fromDate });
    if (toDate) grantedQb.andWhere('settlement.settlementDate <= :toDate', { toDate });

    const grantedRows = await grantedQb.getRawMany();
    const grantedByEmployee = new Map<number, number>(
      grantedRows.map((r) => [r.employeeId, Number(r.totalCustodyGranted)]),
    );

    return settledRows
      .map((r) => ({
        employeeId: r.employeeId,
        employeeName: r.employeeName,
        employeeCode: r.employeeCode,
        settlementsCount: Number(r.settlementsCount),
        totalSettled: Number(r.totalSettled),
        totalCustodyGranted: grantedByEmployee.get(r.employeeId) ?? 0,
        lastSettlementDate: r.lastSettlementDate,
      }))
      .sort((a, b) => b.totalSettled - a.totalSettled);
  }

  // ============================================================
  // تقرير المصاريف الشامل: كل بنود الصرف (من أي حساب) في فترة معينة
  // بالتاريخ ورقم الإذن ومركز التكلفة والمصروف الرئيسي والفرعي - يُستخدم
  // في شاشة تصدير المصاريف لإكسيل والطباعة
  // ============================================================
  async getExpensesReport(fromDate?: string, toDate?: string) {
    const qb = this.voucherRepo
      .createQueryBuilder('voucher')
      .innerJoin('voucher.lines', 'line')
      .leftJoin('line.mainCategory', 'mainCategory')
      .leftJoin('line.subCategory', 'subCategory')
      .leftJoin('line.costCenter', 'costCenter')
      .leftJoin('voucher.branch', 'branch')
      .leftJoin('voucher.bankAccount', 'bankAccount')
      .leftJoin('voucher.wallet', 'wallet')
      .where('voucher.voucherType = :type', { type: VoucherType.EXPENSE })
      .andWhere('voucher.status = :status', { status: VoucherStatus.DISBURSED })
      .andWhere('voucher.isDeleted = false')
      .select([
        'voucher.id AS "voucherId"',
        'voucher.serialNumber AS "serialNumber"',
        'voucher.voucherDate AS "voucherDate"',
        'line.amount AS amount',
        'line.description AS description',
        'mainCategory.name AS "mainCategoryName"',
        'subCategory.name AS "subCategoryName"',
        'costCenter.name AS "costCenterName"',
        'branch.name AS "branchName"',
        'bankAccount.bankName AS "bankName"',
        'wallet.walletProvider AS "walletProvider"',
      ]);

    if (fromDate) qb.andWhere('voucher.voucherDate >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('voucher.voucherDate <= :toDate', { toDate });

    qb.orderBy('voucher.voucherDate', 'ASC').addOrderBy('voucher.serialNumber', 'ASC');

    const rows = await qb.getRawMany();

    return rows.map((r) => ({
      voucherId: r.voucherId,
      date: r.voucherDate,
      serialNumber: r.serialNumber,
      costCenter: r.costCenterName || '-',
      mainCategory: r.mainCategoryName || '-',
      subCategory: r.subCategoryName || '-',
      account: r.branchName || r.bankName || r.walletProvider || '-',
      description: r.description || '',
      amount: Number(r.amount),
    }));
  }
}
