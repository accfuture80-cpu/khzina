"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const treasury_voucher_entity_1 = require("../../entities/treasury-voucher.entity");
const treasury_transfer_entity_1 = require("../../entities/treasury-transfer.entity");
const account_balance_entity_1 = require("../../entities/account-balance.entity");
const voucher_line_entity_1 = require("../../entities/voucher-line.entity");
const custody_settlement_entity_1 = require("../../entities/custody-settlement.entity");
let ReportsService = class ReportsService {
    constructor(voucherRepo, transferRepo, balanceRepo, voucherLineRepo, settlementRepo) {
        this.voucherRepo = voucherRepo;
        this.transferRepo = transferRepo;
        this.balanceRepo = balanceRepo;
        this.voucherLineRepo = voucherLineRepo;
        this.settlementRepo = settlementRepo;
    }
    async getAccountStatement(accountType, accountId, fromDate, toDate) {
        const voucherAccountColumn = accountType === treasury_transfer_entity_1.AccountKind.BANK
            ? 'voucher.bankAccount'
            : accountType === treasury_transfer_entity_1.AccountKind.WALLET
                ? 'voucher.wallet'
                : 'voucher.branch';
        let previousBalance = 0;
        if (fromDate) {
            const priorVouchers = await this.voucherRepo
                .createQueryBuilder('voucher')
                .where(`${voucherAccountColumn} = :accountId`, { accountId })
                .andWhere('voucher.status = :status', { status: treasury_voucher_entity_1.VoucherStatus.DISBURSED })
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
                .andWhere('t.status = :status', { status: treasury_transfer_entity_1.TransferStatus.EXECUTED })
                .andWhere('t.transferDate < :fromDate', { fromDate })
                .select('COALESCE(SUM(t.amount + t.commissionAmount), 0)', 'total')
                .getRawOne();
            const priorTransfersIn = await this.transferRepo
                .createQueryBuilder('t')
                .where('t.toType = :accountType', { accountType })
                .andWhere('t.toId = :accountId', { accountId })
                .andWhere('t.status = :status', { status: treasury_transfer_entity_1.TransferStatus.EXECUTED })
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
            .andWhere('voucher.status = :status', { status: treasury_voucher_entity_1.VoucherStatus.DISBURSED })
            .andWhere('voucher.isDeleted = false');
        if (fromDate)
            query = query.andWhere('voucher.voucherDate >= :fromDate', { fromDate });
        if (toDate)
            query = query.andWhere('voucher.voucherDate <= :toDate', { toDate });
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
            }
            else if (l.voucherType === 'revenue') {
                totalRevenue += amount;
            }
            else if (l.voucherType === 'expense') {
                totalExpense += amount;
            }
        }
        const transfersOutRow = await this.transferRepo
            .createQueryBuilder('t')
            .where('t.fromType = :accountType', { accountType })
            .andWhere('t.fromId = :accountId', { accountId })
            .andWhere('t.status = :status', { status: treasury_transfer_entity_1.TransferStatus.EXECUTED })
            .select('COALESCE(SUM(t.amount + t.commissionAmount), 0)', 'total')
            .getRawOne();
        const transfersInRow = await this.transferRepo
            .createQueryBuilder('t')
            .where('t.toType = :accountType', { accountType })
            .andWhere('t.toId = :accountId', { accountId })
            .andWhere('t.status = :status', { status: treasury_transfer_entity_1.TransferStatus.EXECUTED })
            .select('COALESCE(SUM(t.amount), 0)', 'total')
            .getRawOne();
        const balance = await this.balanceRepo.findOne({ where: { accountType, accountId } });
        const periodNet = totalRevenue + treasuryFunding - totalExpense;
        const closingBalance = fromDate ? previousBalance + periodNet : Number(balance?.currentBalance || 0);
        const categoryMap = new Map();
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
        const voucherMap = new Map();
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
    async getVendorsStatement(fromDate, toDate) {
        const qb = this.voucherLineRepo
            .createQueryBuilder('line')
            .innerJoin('line.voucher', 'voucher')
            .innerJoin('line.vendor', 'vendor')
            .where('line.lineType = :lineType', { lineType: 'vendor_payment' })
            .andWhere('voucher.status = :status', { status: treasury_voucher_entity_1.VoucherStatus.DISBURSED })
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
        if (fromDate)
            qb.andWhere('voucher.voucherDate >= :fromDate', { fromDate });
        if (toDate)
            qb.andWhere('voucher.voucherDate <= :toDate', { toDate });
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
    async getCustomersStatement(fromDate, toDate) {
        const qb = this.voucherLineRepo
            .createQueryBuilder('line')
            .innerJoin('line.voucher', 'voucher')
            .innerJoin('line.customer', 'customer')
            .where('line.lineType IN (:...lineTypes)', {
            lineTypes: ['customer_collection', 'other_revenue'],
        })
            .andWhere('voucher.status = :status', { status: treasury_voucher_entity_1.VoucherStatus.DISBURSED })
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
        if (fromDate)
            qb.andWhere('voucher.voucherDate >= :fromDate', { fromDate });
        if (toDate)
            qb.andWhere('voucher.voucherDate <= :toDate', { toDate });
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
    async getCustodySettlementsStatement(fromDate, toDate) {
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
        if (fromDate)
            settledQb.andWhere('settlement.settlementDate >= :fromDate', { fromDate });
        if (toDate)
            settledQb.andWhere('settlement.settlementDate <= :toDate', { toDate });
        const settledRows = await settledQb.getRawMany();
        const grantedQb = this.settlementRepo
            .createQueryBuilder('settlement')
            .innerJoin('settlement.employee', 'employee')
            .innerJoin('settlement.custodyVoucherLine', 'custodyLine')
            .where('settlement.status = :status', { status: 'approved' })
            .select('employee.id', 'employeeId')
            .addSelect('COALESCE(SUM(custodyLine.amount), 0)', 'totalCustodyGranted')
            .groupBy('employee.id');
        if (fromDate)
            grantedQb.andWhere('settlement.settlementDate >= :fromDate', { fromDate });
        if (toDate)
            grantedQb.andWhere('settlement.settlementDate <= :toDate', { toDate });
        const grantedRows = await grantedQb.getRawMany();
        const grantedByEmployee = new Map(grantedRows.map((r) => [r.employeeId, Number(r.totalCustodyGranted)]));
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
    async getExpensesReport(fromDate, toDate) {
        const qb = this.voucherRepo
            .createQueryBuilder('voucher')
            .innerJoin('voucher.lines', 'line')
            .leftJoin('line.mainCategory', 'mainCategory')
            .leftJoin('line.subCategory', 'subCategory')
            .leftJoin('line.costCenter', 'costCenter')
            .leftJoin('voucher.branch', 'branch')
            .leftJoin('voucher.bankAccount', 'bankAccount')
            .leftJoin('voucher.wallet', 'wallet')
            .where('voucher.voucherType = :type', { type: treasury_voucher_entity_1.VoucherType.EXPENSE })
            .andWhere('voucher.status = :status', { status: treasury_voucher_entity_1.VoucherStatus.DISBURSED })
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
        if (fromDate)
            qb.andWhere('voucher.voucherDate >= :fromDate', { fromDate });
        if (toDate)
            qb.andWhere('voucher.voucherDate <= :toDate', { toDate });
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(treasury_voucher_entity_1.TreasuryVoucher)),
    __param(1, (0, typeorm_1.InjectRepository)(treasury_transfer_entity_1.TreasuryTransfer)),
    __param(2, (0, typeorm_1.InjectRepository)(account_balance_entity_1.AccountBalance)),
    __param(3, (0, typeorm_1.InjectRepository)(voucher_line_entity_1.VoucherLine)),
    __param(4, (0, typeorm_1.InjectRepository)(custody_settlement_entity_1.CustodySettlement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map