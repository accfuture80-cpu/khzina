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
exports.CustodySettlementsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const custody_settlement_entity_1 = require("../../entities/custody-settlement.entity");
const custody_settlement_line_entity_1 = require("../../entities/custody-settlement-line.entity");
const voucher_line_entity_1 = require("../../entities/voucher-line.entity");
const role_entity_1 = require("../../entities/role.entity");
const roles_guard_1 = require("../auth/guards/roles.guard");
const serial_number_service_1 = require("../common/serial-number.service");
let CustodySettlementsService = class CustodySettlementsService {
    constructor(settlementRepo, voucherLineRepo, dataSource, serialNumberService) {
        this.settlementRepo = settlementRepo;
        this.voucherLineRepo = voucherLineRepo;
        this.dataSource = dataSource;
        this.serialNumberService = serialNumberService;
    }
    async create(dto, currentUser) {
        const custodyLine = await this.voucherLineRepo.findOne({
            where: { id: dto.custodyVoucherLineId },
        });
        if (!custodyLine || custodyLine.lineType !== voucher_line_entity_1.VoucherLineType.CUSTODY_ADVANCE) {
            throw new common_1.BadRequestException('البند المحدد مش عهدة/سلفة صالحة للتسوية');
        }
        const totalNewLines = dto.lines.reduce((sum, l) => sum + l.amount, 0);
        const alreadySettled = await this.settlementRepo
            .createQueryBuilder('s')
            .leftJoin('s.lines', 'l')
            .where('s.custodyVoucherLineId = :lineId', { lineId: custodyLine.id })
            .select('COALESCE(SUM(l.amount), 0)', 'total')
            .getRawOne();
        const remaining = Number(custodyLine.amount) - Number(alreadySettled?.total || 0);
        if (totalNewLines > remaining) {
            throw new common_1.BadRequestException(`المبلغ أكبر من المتبقي في العهدة (المتبقي: ${remaining})`);
        }
        return this.dataSource.transaction(async (manager) => {
            const serialNumber = await this.serialNumberService.generate(manager, 'settlement', 'SET');
            const settlement = manager.create(custody_settlement_entity_1.CustodySettlement, {
                serialNumber,
                custodyVoucherLine: { id: custodyLine.id },
                employee: { id: dto.employeeId },
                settlementDate: dto.settlementDate,
                status: custody_settlement_entity_1.SettlementStatus.DRAFT,
                createdBy: { id: currentUser.userId },
                lines: dto.lines.map((l) => manager.create(custody_settlement_line_entity_1.CustodySettlementLine, {
                    mainCategory: l.mainCategoryId ? { id: l.mainCategoryId } : null,
                    subCategory: l.subCategoryId ? { id: l.subCategoryId } : null,
                    costCenter: l.costCenterId ? { id: l.costCenterId } : null,
                    amount: l.amount,
                    description: l.description,
                })),
            });
            return manager.save(settlement);
        });
    }
    async getAvailableCustodyLines() {
        const lines = await this.voucherLineRepo
            .createQueryBuilder('line')
            .innerJoin('line.voucher', 'voucher')
            .innerJoin('line.employee', 'employee')
            .where('line.lineType = :lineType', { lineType: voucher_line_entity_1.VoucherLineType.CUSTODY_ADVANCE })
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
        if (lines.length === 0)
            return [];
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
    async approve(id, currentUser) {
        const hasFullAccess = currentUser.roles.some((r) => roles_guard_1.FULL_ACCESS_ROLES.includes(r));
        if (!hasFullAccess && !currentUser.roles.includes(role_entity_1.RoleCode.FINANCIAL_MANAGER)) {
            throw new common_1.ForbiddenException('اعتماد التسوية من صلاحية المدير المالي فقط');
        }
        const settlement = await this.findOneOrFail(id);
        settlement.status = custody_settlement_entity_1.SettlementStatus.APPROVED;
        return this.settlementRepo.save(settlement);
    }
    async findAll() {
        return this.settlementRepo.find({
            relations: ['employee', 'custodyVoucherLine', 'lines', 'createdBy'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOneOrFail(id) {
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
        if (!settlement)
            throw new common_1.NotFoundException('التسوية غير موجودة');
        return settlement;
    }
};
exports.CustodySettlementsService = CustodySettlementsService;
exports.CustodySettlementsService = CustodySettlementsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(custody_settlement_entity_1.CustodySettlement)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_line_entity_1.VoucherLine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        serial_number_service_1.SerialNumberService])
], CustodySettlementsService);
//# sourceMappingURL=custody-settlements.service.js.map