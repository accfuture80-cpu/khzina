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
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const treasury_transfer_entity_1 = require("../../entities/treasury-transfer.entity");
const account_balance_entity_1 = require("../../entities/account-balance.entity");
const role_entity_1 = require("../../entities/role.entity");
const roles_guard_1 = require("../auth/guards/roles.guard");
const serial_number_service_1 = require("../common/serial-number.service");
let TransfersService = class TransfersService {
    constructor(transferRepo, dataSource, serialNumberService) {
        this.transferRepo = transferRepo;
        this.dataSource = dataSource;
        this.serialNumberService = serialNumberService;
    }
    async create(dto, currentUser) {
        if (dto.fromType === dto.toType && dto.fromId === dto.toId) {
            throw new common_1.BadRequestException('لازم يكون الحساب المُحوَّل منه غير المُحوَّل إليه');
        }
        return this.dataSource.transaction(async (manager) => {
            const serialNumber = await this.serialNumberService.generate(manager, 'transfer', 'TRF');
            const transfer = manager.create(treasury_transfer_entity_1.TreasuryTransfer, {
                serialNumber,
                transferDate: dto.transferDate,
                fromType: dto.fromType,
                fromId: dto.fromId,
                toType: dto.toType,
                toId: dto.toId,
                amount: dto.amount,
                commissionAmount: dto.commissionAmount ?? 0,
                status: treasury_transfer_entity_1.TransferStatus.PENDING,
                createdBy: { id: currentUser.userId },
            });
            return manager.save(transfer);
        });
    }
    async approve(id, currentUser) {
        const hasFullAccess = currentUser.roles.some((r) => roles_guard_1.FULL_ACCESS_ROLES.includes(r));
        if (!hasFullAccess && !currentUser.roles.includes(role_entity_1.RoleCode.FINANCIAL_MANAGER)) {
            throw new common_1.ForbiddenException('اعتماد التحويل من صلاحية المدير المالي فقط');
        }
        const transfer = await this.findOneOrFail(id);
        if (transfer.status !== treasury_transfer_entity_1.TransferStatus.PENDING) {
            throw new common_1.BadRequestException('التحويل ده اتاعتمد أو اتنفذ قبل كده');
        }
        transfer.status = treasury_transfer_entity_1.TransferStatus.APPROVED;
        return this.transferRepo.save(transfer);
    }
    async execute(id, currentUser) {
        const hasFullAccess = currentUser.roles.some((r) => roles_guard_1.FULL_ACCESS_ROLES.includes(r));
        if (!hasFullAccess && !currentUser.roles.includes(role_entity_1.RoleCode.TREASURY_ACCOUNTANT)) {
            throw new common_1.ForbiddenException('تنفيذ التحويل من صلاحية محاسب الخزينة فقط');
        }
        const transfer = await this.findOneOrFail(id);
        if (transfer.status !== treasury_transfer_entity_1.TransferStatus.APPROVED) {
            throw new common_1.BadRequestException('التحويل لازم يكون معتمد الأول');
        }
        return this.dataSource.transaction(async (manager) => {
            const fromBalance = await this.getOrCreateBalance(manager, transfer.fromType, transfer.fromId);
            fromBalance.currentBalance =
                Number(fromBalance.currentBalance) -
                    (Number(transfer.amount) + Number(transfer.commissionAmount));
            await manager.save(fromBalance);
            const toBalance = await this.getOrCreateBalance(manager, transfer.toType, transfer.toId);
            toBalance.currentBalance = Number(toBalance.currentBalance) + Number(transfer.amount);
            await manager.save(toBalance);
            transfer.status = treasury_transfer_entity_1.TransferStatus.EXECUTED;
            return manager.save(transfer);
        });
    }
    async getOrCreateBalance(manager, accountType, accountId) {
        let balance = await manager.findOne(account_balance_entity_1.AccountBalance, {
            where: { accountType, accountId },
        });
        if (!balance) {
            balance = manager.create(account_balance_entity_1.AccountBalance, {
                accountType,
                accountId,
                currentBalance: 0,
            });
        }
        return balance;
    }
    async findAll() {
        return this.transferRepo.find({
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOneOrFail(id) {
        const transfer = await this.transferRepo.findOne({
            where: { id },
            relations: ['createdBy'],
        });
        if (!transfer)
            throw new common_1.NotFoundException('التحويل غير موجود');
        return transfer;
    }
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(treasury_transfer_entity_1.TreasuryTransfer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        serial_number_service_1.SerialNumberService])
], TransfersService);
//# sourceMappingURL=transfers.service.js.map