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
exports.VouchersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const treasury_voucher_entity_1 = require("../../entities/treasury-voucher.entity");
const voucher_line_entity_1 = require("../../entities/voucher-line.entity");
const voucher_approval_entity_1 = require("../../entities/voucher-approval.entity");
const account_balance_entity_1 = require("../../entities/account-balance.entity");
const workflow_settings_entity_1 = require("../../entities/workflow-settings.entity");
const treasury_transfer_entity_1 = require("../../entities/treasury-transfer.entity");
const role_entity_1 = require("../../entities/role.entity");
const roles_guard_1 = require("../auth/guards/roles.guard");
const serial_number_service_1 = require("../common/serial-number.service");
let VouchersService = class VouchersService {
    constructor(voucherRepo, approvalRepo, balanceRepo, workflowSettingsRepo, dataSource, serialNumberService) {
        this.voucherRepo = voucherRepo;
        this.approvalRepo = approvalRepo;
        this.balanceRepo = balanceRepo;
        this.workflowSettingsRepo = workflowSettingsRepo;
        this.dataSource = dataSource;
        this.serialNumberService = serialNumberService;
    }
    async create(dto, currentUser) {
        const isAdminManager = currentUser.roles.includes(role_entity_1.RoleCode.ADMIN_MANAGER);
        const isProductionManager = currentUser.roles.includes(role_entity_1.RoleCode.PRODUCTION_MANAGER);
        if ((isAdminManager || isProductionManager) && !dto.walletId) {
            throw new common_1.ForbiddenException('لا يحق لك إنشاء إلا أذون المحافظ الإلكترونية');
        }
        if (dto.voucherType === treasury_voucher_entity_1.VoucherType.EXPENSE && !dto.approvalPath) {
            throw new common_1.BadRequestException('لازم تحدد مسار الاعتماد (مدير إداري أو مدير إنتاج) لإذن الصرف');
        }
        return this.dataSource.transaction(async (manager) => {
            const prefix = dto.voucherType === treasury_voucher_entity_1.VoucherType.EXPENSE ? 'EXP' : 'REV';
            const serialNumber = await this.serialNumberService.generate(manager, dto.voucherType, prefix);
            const totalAmount = dto.lines.reduce((sum, l) => sum + l.amount, 0);
            const voucher = manager.create(treasury_voucher_entity_1.TreasuryVoucher, {
                voucherType: dto.voucherType,
                serialNumber,
                voucherDate: dto.voucherDate,
                currency: { id: dto.currencyId },
                paymentMethod: dto.paymentMethod,
                branch: dto.branchId ? { id: dto.branchId } : undefined,
                bankAccount: dto.bankAccountId ? { id: dto.bankAccountId } : undefined,
                wallet: dto.walletId ? { id: dto.walletId } : undefined,
                approvalPath: dto.approvalPath,
                notes: dto.notes,
                status: treasury_voucher_entity_1.VoucherStatus.DRAFT,
                totalAmount,
                createdBy: { id: currentUser.userId },
                lines: dto.lines.map((l) => manager.create(voucher_line_entity_1.VoucherLine, {
                    lineType: l.lineType,
                    mainCategory: l.mainCategoryId ? { id: l.mainCategoryId } : null,
                    subCategory: l.subCategoryId ? { id: l.subCategoryId } : null,
                    costCenter: l.costCenterId ? { id: l.costCenterId } : null,
                    employee: l.employeeId ? { id: l.employeeId } : null,
                    vehicle: l.vehicleId ? { id: l.vehicleId } : null,
                    vendor: l.vendorId ? { id: l.vendorId } : null,
                    customer: l.customerId ? { id: l.customerId } : null,
                    amount: l.amount,
                    description: l.description,
                })),
            });
            return manager.save(voucher);
        });
    }
    async submit(id, currentUser) {
        const voucher = await this.findOneOrFail(id);
        const isAdminManager = currentUser.roles.includes(role_entity_1.RoleCode.ADMIN_MANAGER);
        const isProductionManager = currentUser.roles.includes(role_entity_1.RoleCode.PRODUCTION_MANAGER);
        if (isAdminManager && voucher.approvalPath !== treasury_voucher_entity_1.ApprovalPath.ADMIN_MANAGER && !voucher.wallet) {
            throw new common_1.ForbiddenException('لا يحق لك إرسال هذا الإذن');
        }
        if (isProductionManager && voucher.approvalPath !== treasury_voucher_entity_1.ApprovalPath.PRODUCTION_MANAGER && !voucher.wallet) {
            throw new common_1.ForbiddenException('لا يحق لك إرسال هذا الإذن');
        }
        if (voucher.status !== treasury_voucher_entity_1.VoucherStatus.DRAFT &&
            voucher.status !== treasury_voucher_entity_1.VoucherStatus.REJECTED) {
            throw new common_1.BadRequestException('الإذن ده مش في حالة تسمح بالإرسال (مسودة أو مرفوض فقط)');
        }
        voucher.status = treasury_voucher_entity_1.VoucherStatus.PENDING_FIRST_APPROVAL;
        return this.voucherRepo.save(voucher);
    }
    getExpectedRole(voucher) {
        switch (voucher.status) {
            case treasury_voucher_entity_1.VoucherStatus.PENDING_FIRST_APPROVAL: {
                const role = voucher.voucherType === treasury_voucher_entity_1.VoucherType.REVENUE
                    ? role_entity_1.RoleCode.PRODUCTION_MANAGER
                    : voucher.approvalPath === treasury_voucher_entity_1.ApprovalPath.ADMIN_MANAGER
                        ? role_entity_1.RoleCode.ADMIN_MANAGER
                        : role_entity_1.RoleCode.PRODUCTION_MANAGER;
                return { role, step: voucher_approval_entity_1.ApprovalStep.FIRST_APPROVAL };
            }
            case treasury_voucher_entity_1.VoucherStatus.PENDING_FINANCIAL_REVIEW:
                return { role: role_entity_1.RoleCode.FINANCIAL_MANAGER, step: voucher_approval_entity_1.ApprovalStep.FINANCIAL_REVIEW };
            case treasury_voucher_entity_1.VoucherStatus.PENDING_GM_APPROVAL:
                return { role: role_entity_1.RoleCode.GENERAL_MANAGER, step: voucher_approval_entity_1.ApprovalStep.GM_APPROVAL };
            default:
                throw new common_1.BadRequestException('الإذن مش في خطوة اعتماد حاليًا');
        }
    }
    async decide(id, dto, currentUser) {
        const voucher = await this.findOneOrFail(id);
        const isAdminManager = currentUser.roles.includes(role_entity_1.RoleCode.ADMIN_MANAGER);
        const isProductionManager = currentUser.roles.includes(role_entity_1.RoleCode.PRODUCTION_MANAGER);
        if (isAdminManager && voucher.approvalPath !== treasury_voucher_entity_1.ApprovalPath.ADMIN_MANAGER && !voucher.wallet) {
            throw new common_1.ForbiddenException('لا يحق لك اعتماد هذا الإذن');
        }
        if (isProductionManager && voucher.approvalPath !== treasury_voucher_entity_1.ApprovalPath.PRODUCTION_MANAGER && !voucher.wallet) {
            throw new common_1.ForbiddenException('لا يحق لك اعتماد هذا الإذن');
        }
        const { role, step } = this.getExpectedRole(voucher);
        const hasFullAccess = currentUser.roles.some((r) => roles_guard_1.FULL_ACCESS_ROLES.includes(r));
        if (!hasFullAccess && !currentUser.roles.includes(role)) {
            throw new common_1.ForbiddenException('مش من صلاحياتك تاخد قرار في الخطوة دي');
        }
        return this.dataSource.transaction(async (manager) => {
            await manager.save(manager.create(voucher_approval_entity_1.VoucherApproval, {
                voucher: { id: voucher.id },
                step,
                approver: { id: currentUser.userId },
                decision: dto.decision,
                comment: dto.comment,
            }));
            if (dto.decision === voucher_approval_entity_1.ApprovalDecision.REJECTED) {
                voucher.status = treasury_voucher_entity_1.VoucherStatus.REJECTED;
            }
            else {
                const workflow = await this.workflowSettingsRepo.findOne({ where: {} });
                const requireFinancialReview = workflow?.requireFinancialReview ?? true;
                const requireGmApproval = workflow?.requireGmApproval ?? true;
                if (step === voucher_approval_entity_1.ApprovalStep.FIRST_APPROVAL) {
                    if (requireFinancialReview)
                        voucher.status = treasury_voucher_entity_1.VoucherStatus.PENDING_FINANCIAL_REVIEW;
                    else if (requireGmApproval)
                        voucher.status = treasury_voucher_entity_1.VoucherStatus.PENDING_GM_APPROVAL;
                    else
                        voucher.status = treasury_voucher_entity_1.VoucherStatus.APPROVED_FINAL;
                }
                else if (step === voucher_approval_entity_1.ApprovalStep.FINANCIAL_REVIEW) {
                    if (requireGmApproval)
                        voucher.status = treasury_voucher_entity_1.VoucherStatus.PENDING_GM_APPROVAL;
                    else
                        voucher.status = treasury_voucher_entity_1.VoucherStatus.APPROVED_FINAL;
                }
                else if (step === voucher_approval_entity_1.ApprovalStep.GM_APPROVAL) {
                    voucher.status = treasury_voucher_entity_1.VoucherStatus.APPROVED_FINAL;
                }
            }
            return manager.save(voucher);
        });
    }
    async disburse(id, currentUser) {
        const isAdminManager = currentUser.roles.includes(role_entity_1.RoleCode.ADMIN_MANAGER);
        const isProductionManager = currentUser.roles.includes(role_entity_1.RoleCode.PRODUCTION_MANAGER);
        if (isAdminManager || isProductionManager) {
            throw new common_1.ForbiddenException('لا يحق لك الصرف الفعلي');
        }
        const hasFullAccess = currentUser.roles.some((r) => roles_guard_1.FULL_ACCESS_ROLES.includes(r));
        if (!hasFullAccess && !currentUser.roles.includes(role_entity_1.RoleCode.TREASURY_ACCOUNTANT)) {
            throw new common_1.ForbiddenException('الصرف الفعلي من صلاحية محاسب الخزينة فقط');
        }
        const voucher = await this.findOneOrFail(id);
        if (voucher.status !== treasury_voucher_entity_1.VoucherStatus.APPROVED_FINAL) {
            throw new common_1.BadRequestException('الإذن لازم يكون معتمد نهائيًا الأول');
        }
        return this.dataSource.transaction(async (manager) => {
            voucher.status = treasury_voucher_entity_1.VoucherStatus.DISBURSED;
            voucher.disbursedBy = { id: currentUser.userId };
            voucher.disbursedAt = new Date();
            await manager.save(voucher);
            await this.applyBalanceEffect(manager, voucher);
            await manager.save(manager.create(voucher_approval_entity_1.VoucherApproval, {
                voucher: { id: voucher.id },
                step: voucher_approval_entity_1.ApprovalStep.DISBURSEMENT,
                approver: { id: currentUser.userId },
                decision: voucher_approval_entity_1.ApprovalDecision.APPROVED,
            }));
            return voucher;
        });
    }
    async applyBalanceEffect(manager, voucher, direction = 1) {
        let accountType;
        let accountId;
        if (voucher.bankAccount) {
            accountType = treasury_transfer_entity_1.AccountKind.BANK;
            accountId = voucher.bankAccount.id;
        }
        else if (voucher.wallet) {
            accountType = treasury_transfer_entity_1.AccountKind.WALLET;
            accountId = voucher.wallet.id;
        }
        else if (voucher.branch) {
            accountType = voucher.branch.isMain
                ? treasury_transfer_entity_1.AccountKind.MAIN_TREASURY
                : treasury_transfer_entity_1.AccountKind.BRANCH;
            accountId = voucher.branch.id;
        }
        else {
            return;
        }
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
        const sign = (voucher.voucherType === treasury_voucher_entity_1.VoucherType.REVENUE ? 1 : -1) * direction;
        balance.currentBalance = Number(balance.currentBalance) + sign * Number(voucher.totalAmount);
        await manager.save(balance);
    }
    async duplicate(id, currentUser) {
        const isAdminManager = currentUser.roles.includes(role_entity_1.RoleCode.ADMIN_MANAGER);
        const isProductionManager = currentUser.roles.includes(role_entity_1.RoleCode.PRODUCTION_MANAGER);
        if (isAdminManager || isProductionManager) {
            throw new common_1.ForbiddenException('لا يحق لك تكرار الإذن');
        }
        const original = await this.findOneOrFail(id);
        return this.dataSource.transaction(async (manager) => {
            const prefix = original.voucherType === treasury_voucher_entity_1.VoucherType.EXPENSE ? 'EXP' : 'REV';
            const serialNumber = await this.serialNumberService.generate(manager, original.voucherType, prefix);
            const copy = manager.create(treasury_voucher_entity_1.TreasuryVoucher, {
                voucherType: original.voucherType,
                serialNumber,
                voucherDate: new Date().toISOString().slice(0, 10),
                currency: original.currency,
                paymentMethod: original.paymentMethod,
                branch: original.branch,
                bankAccount: original.bankAccount,
                wallet: original.wallet,
                approvalPath: original.approvalPath ?? undefined,
                notes: original.notes,
                status: treasury_voucher_entity_1.VoucherStatus.DRAFT,
                totalAmount: original.totalAmount,
                createdBy: { id: currentUser.userId },
                duplicatedFrom: { id: original.id },
                lines: original.lines.map((l) => manager.create(voucher_line_entity_1.VoucherLine, {
                    lineType: l.lineType,
                    mainCategory: l.mainCategory,
                    subCategory: l.subCategory,
                    costCenter: l.costCenter,
                    employee: l.employee,
                    vehicle: l.vehicle,
                    vendor: l.vendor,
                    customer: l.customer,
                    amount: l.amount,
                    description: l.description,
                })),
            });
            return manager.save(copy);
        });
    }
    async update(id, dto, currentUser) {
        const voucher = await this.findOneOrFail(id);
        const isAdminManager = currentUser.roles.includes(role_entity_1.RoleCode.ADMIN_MANAGER);
        const isProductionManager = currentUser.roles.includes(role_entity_1.RoleCode.PRODUCTION_MANAGER);
        if (isAdminManager && voucher.approvalPath !== treasury_voucher_entity_1.ApprovalPath.ADMIN_MANAGER && !voucher.wallet) {
            throw new common_1.ForbiddenException('لا يحق لك تعديل هذا الإذن');
        }
        if (isProductionManager && voucher.approvalPath !== treasury_voucher_entity_1.ApprovalPath.PRODUCTION_MANAGER && !voucher.wallet) {
            throw new common_1.ForbiddenException('لا يحق لك تعديل هذا الإذن');
        }
        if ((isAdminManager || isProductionManager) &&
            (voucher.status === treasury_voucher_entity_1.VoucherStatus.APPROVED_FINAL || voucher.status === treasury_voucher_entity_1.VoucherStatus.DISBURSED)) {
            throw new common_1.ForbiddenException('لا يمكن تعديل الإذن بعد الاعتماد');
        }
        const isPrivileged = currentUser.roles.some((r) => roles_guard_1.FULL_ACCESS_ROLES.includes(r)) ||
            currentUser.roles.includes(role_entity_1.RoleCode.TREASURY_ACCOUNTANT);
        const isEditableStatus = voucher.status === treasury_voucher_entity_1.VoucherStatus.DRAFT ||
            voucher.status === treasury_voucher_entity_1.VoucherStatus.REJECTED;
        if (!isEditableStatus && !isPrivileged) {
            throw new common_1.ForbiddenException('الإذن ده مش قابل للتعديل في الحالة دي');
        }
        return this.dataSource.transaction(async (manager) => {
            const wasDisbursed = voucher.status === treasury_voucher_entity_1.VoucherStatus.DISBURSED;
            const before = {
                bankAccount: voucher.bankAccount,
                wallet: voucher.wallet,
                branch: voucher.branch,
                totalAmount: voucher.totalAmount,
                voucherType: voucher.voucherType,
            };
            Object.assign(voucher, {
                voucherDate: dto.voucherDate ?? voucher.voucherDate,
                notes: dto.notes ?? voucher.notes,
                paymentMethod: dto.paymentMethod ?? voucher.paymentMethod,
                branch: dto.branchId !== undefined ? { id: dto.branchId } : voucher.branch,
                bankAccount: dto.bankAccountId !== undefined ? { id: dto.bankAccountId } : voucher.bankAccount,
                wallet: dto.walletId !== undefined ? { id: dto.walletId } : voucher.wallet,
                approvalPath: dto.approvalPath ?? voucher.approvalPath,
            });
            if (dto.lines) {
                await manager.delete(voucher_line_entity_1.VoucherLine, { voucher: { id: voucher.id } });
                voucher.lines = dto.lines.map((l) => manager.create(voucher_line_entity_1.VoucherLine, {
                    voucher: { id: voucher.id },
                    lineType: l.lineType,
                    mainCategory: l.mainCategoryId ? { id: l.mainCategoryId } : null,
                    subCategory: l.subCategoryId ? { id: l.subCategoryId } : null,
                    costCenter: l.costCenterId ? { id: l.costCenterId } : null,
                    employee: l.employeeId ? { id: l.employeeId } : null,
                    vehicle: l.vehicleId ? { id: l.vehicleId } : null,
                    vendor: l.vendorId ? { id: l.vendorId } : null,
                    customer: l.customerId ? { id: l.customerId } : null,
                    amount: l.amount,
                    description: l.description,
                }));
                voucher.totalAmount = dto.lines.reduce((sum, l) => sum + l.amount, 0);
            }
            if (voucher.status === treasury_voucher_entity_1.VoucherStatus.REJECTED) {
                voucher.status = treasury_voucher_entity_1.VoucherStatus.DRAFT;
            }
            const saved = await manager.save(voucher);
            if (wasDisbursed) {
                await this.applyBalanceEffect(manager, before, -1);
                await this.applyBalanceEffect(manager, saved, 1);
            }
            return saved;
        });
    }
    async softDelete(id, currentUser) {
        const voucher = await this.findOneOrFail(id);
        const isSystemAdmin = currentUser.roles.includes(role_entity_1.RoleCode.SYSTEM_ADMIN);
        const isOwnDraft = currentUser.roles.includes(role_entity_1.RoleCode.ACCOUNTANT) &&
            voucher.status === treasury_voucher_entity_1.VoucherStatus.DRAFT &&
            voucher.createdBy?.id === currentUser.userId;
        if (!isSystemAdmin && !isOwnDraft) {
            throw new common_1.ForbiddenException('مش من صلاحياتك حذف الإذن ده - المحاسب يقدر يحذف بس المسودة اللي عملها بنفسه، ومدير النظام بس اللي يحذف أي إذن في أي حالة');
        }
        return this.dataSource.transaction(async (manager) => {
            if (voucher.status === treasury_voucher_entity_1.VoucherStatus.DISBURSED) {
                await this.applyBalanceEffect(manager, voucher, -1);
            }
            voucher.isDeleted = true;
            return manager.save(voucher);
        });
    }
    async findAll(filters, currentUser) {
        const qb = this.voucherRepo
            .createQueryBuilder('voucher')
            .leftJoinAndSelect('voucher.lines', 'lines')
            .leftJoinAndSelect('voucher.currency', 'currency')
            .leftJoinAndSelect('voucher.branch', 'branch')
            .leftJoinAndSelect('voucher.bankAccount', 'bankAccount')
            .leftJoinAndSelect('voucher.wallet', 'wallet')
            .leftJoinAndSelect('voucher.createdBy', 'createdBy')
            .where('voucher.isDeleted = :isDeleted', { isDeleted: false });
        const isAdminManager = currentUser.roles.includes(role_entity_1.RoleCode.ADMIN_MANAGER);
        const isProductionManager = currentUser.roles.includes(role_entity_1.RoleCode.PRODUCTION_MANAGER);
        if (isAdminManager) {
            qb.andWhere('((voucher.approvalPath = :adminPath AND voucher.voucherType = :expense) OR (wallet.id IS NOT NULL))', { adminPath: treasury_voucher_entity_1.ApprovalPath.ADMIN_MANAGER, expense: treasury_voucher_entity_1.VoucherType.EXPENSE });
            qb.andWhere('voucher.status != :draft', { draft: treasury_voucher_entity_1.VoucherStatus.DRAFT });
        }
        else if (isProductionManager) {
            qb.andWhere('((voucher.approvalPath = :prodPath AND voucher.voucherType = :expense) OR (wallet.id IS NOT NULL))', { prodPath: treasury_voucher_entity_1.ApprovalPath.PRODUCTION_MANAGER, expense: treasury_voucher_entity_1.VoucherType.EXPENSE });
            qb.andWhere('voucher.status != :draft', { draft: treasury_voucher_entity_1.VoucherStatus.DRAFT });
        }
        if (filters.status) {
            qb.andWhere('voucher.status = :status', { status: filters.status });
        }
        if (filters.voucherType) {
            qb.andWhere('voucher.voucherType = :type', { type: filters.voucherType });
        }
        qb.orderBy('voucher.createdAt', 'DESC');
        return qb.getMany();
    }
    async findOneOrFail(id) {
        const voucher = await this.voucherRepo.findOne({
            where: { id, isDeleted: false },
            relations: [
                'lines',
                'lines.mainCategory',
                'lines.subCategory',
                'lines.costCenter',
                'lines.employee',
                'lines.vehicle',
                'lines.vendor',
                'lines.customer',
                'currency',
                'branch',
                'bankAccount',
                'wallet',
                'createdBy',
            ],
        });
        if (!voucher)
            throw new common_1.NotFoundException('الإذن غير موجود');
        return voucher;
    }
    async getApprovalHistory(id) {
        await this.findOneOrFail(id);
        return this.approvalRepo.find({
            where: { voucher: { id } },
            relations: ['approver'],
            order: { decidedAt: 'ASC' },
        });
    }
};
exports.VouchersService = VouchersService;
exports.VouchersService = VouchersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(treasury_voucher_entity_1.TreasuryVoucher)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_approval_entity_1.VoucherApproval)),
    __param(2, (0, typeorm_1.InjectRepository)(account_balance_entity_1.AccountBalance)),
    __param(3, (0, typeorm_1.InjectRepository)(workflow_settings_entity_1.WorkflowSettings)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        serial_number_service_1.SerialNumberService])
], VouchersService);
//# sourceMappingURL=vouchers.service.js.map