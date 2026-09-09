import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  TreasuryVoucher,
  VoucherStatus,
  VoucherType,
  ApprovalPath,
} from '../../entities/treasury-voucher.entity';
import { VoucherLine } from '../../entities/voucher-line.entity';
import {
  VoucherApproval,
  ApprovalStep,
  ApprovalDecision,
} from '../../entities/voucher-approval.entity';
import { AccountBalance } from '../../entities/account-balance.entity';
import { WorkflowSettings } from '../../entities/workflow-settings.entity';
import { AccountKind } from '../../entities/treasury-transfer.entity';
import { RoleCode } from '../../entities/role.entity';
import { FULL_ACCESS_ROLES } from '../auth/guards/roles.guard';
import { SerialNumberService } from '../common/serial-number.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { DecisionDto } from './dto/decision.dto';

export interface CurrentUserPayload {
  userId: number;
  username: string;
  roles: RoleCode[];
}

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(TreasuryVoucher)
    private readonly voucherRepo: Repository<TreasuryVoucher>,
    @InjectRepository(VoucherApproval)
    private readonly approvalRepo: Repository<VoucherApproval>,
    @InjectRepository(AccountBalance)
    private readonly balanceRepo: Repository<AccountBalance>,
    @InjectRepository(WorkflowSettings)
    private readonly workflowSettingsRepo: Repository<WorkflowSettings>,
    private readonly dataSource: DataSource,
    private readonly serialNumberService: SerialNumberService,
  ) {}

  // ============================================================
  // إنشاء إذن جديد (يبدأ كمسودة Draft)
  // ============================================================
  async create(dto: CreateVoucherDto, currentUser: CurrentUserPayload) {
    const isAdminManager = currentUser.roles.includes(RoleCode.ADMIN_MANAGER);
    const isProductionManager = currentUser.roles.includes(RoleCode.PRODUCTION_MANAGER);

    // المدير الإداري والإنتاجي ينشئوا بس أذون المحافظ الإلكترونية
    if ((isAdminManager || isProductionManager) && !dto.walletId) {
      throw new ForbiddenException('لا يحق لك إنشاء إلا أذون المحافظ الإلكترونية');
    }

    if (dto.voucherType === VoucherType.EXPENSE && !dto.approvalPath) {
      throw new BadRequestException(
        'لازم تحدد مسار الاعتماد (مدير إداري أو مدير إنتاج) لإذن الصرف',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const prefix = dto.voucherType === VoucherType.EXPENSE ? 'EXP' : 'REV';
      const serialNumber = await this.serialNumberService.generate(
        manager,
        dto.voucherType,
        prefix,
      );

      const totalAmount = dto.lines.reduce((sum, l) => sum + l.amount, 0);

      const voucher = manager.create(TreasuryVoucher, {
        voucherType: dto.voucherType,
        serialNumber,
        voucherDate: dto.voucherDate,
        currency: { id: dto.currencyId } as any,
        paymentMethod: dto.paymentMethod,
        branch: dto.branchId ? ({ id: dto.branchId } as any) : undefined,
        bankAccount: dto.bankAccountId ? ({ id: dto.bankAccountId } as any) : undefined,
        wallet: dto.walletId ? ({ id: dto.walletId } as any) : undefined,
        approvalPath: dto.approvalPath,
        notes: dto.notes,
        status: VoucherStatus.DRAFT,
        totalAmount,
        createdBy: { id: currentUser.userId } as any,
        lines: dto.lines.map((l) =>
          manager.create(VoucherLine, {
            lineType: l.lineType,
            mainCategory: l.mainCategoryId ? ({ id: l.mainCategoryId } as any) : null,
            subCategory: l.subCategoryId ? ({ id: l.subCategoryId } as any) : null,
            costCenter: l.costCenterId ? ({ id: l.costCenterId } as any) : null,
            employee: l.employeeId ? ({ id: l.employeeId } as any) : null,
            vehicle: l.vehicleId ? ({ id: l.vehicleId } as any) : null,
            vendor: l.vendorId ? ({ id: l.vendorId } as any) : null,
            customer: l.customerId ? ({ id: l.customerId } as any) : null,
            amount: l.amount,
            description: l.description,
          }),
        ),
      });

      return manager.save(voucher);
    });
  }

  // ============================================================
  // اعتماد إرسال الإذن لدورة الاعتماد (من مسودة لأول خطوة)
  // ونفس الدالة بتتستخدم لإعادة الإرسال بعد الرفض والتعديل
  // ============================================================
  async submit(id: number, currentUser: CurrentUserPayload) {
    const voucher = await this.findOneOrFail(id);

    const isAdminManager = currentUser.roles.includes(RoleCode.ADMIN_MANAGER);
    const isProductionManager = currentUser.roles.includes(RoleCode.PRODUCTION_MANAGER);

    // المدير الإداري يرسل بس الإذن الإدارية أو أذون المحافظ
    if (isAdminManager && voucher.approvalPath !== ApprovalPath.ADMIN_MANAGER && !voucher.wallet) {
      throw new ForbiddenException('لا يحق لك إرسال هذا الإذن');
    }

    // المدير الإنتاجي يرسل بس الإذن الإنتاجية أو أذون المحافظ
    if (isProductionManager && voucher.approvalPath !== ApprovalPath.PRODUCTION_MANAGER && !voucher.wallet) {
      throw new ForbiddenException('لا يحق لك إرسال هذا الإذن');
    }

    if (
      voucher.status !== VoucherStatus.DRAFT &&
      voucher.status !== VoucherStatus.REJECTED
    ) {
      throw new BadRequestException(
        'الإذن ده مش في حالة تسمح بالإرسال (مسودة أو مرفوض فقط)',
      );
    }

    voucher.status = VoucherStatus.PENDING_FIRST_APPROVAL;
    return this.voucherRepo.save(voucher);
  }

  // ============================================================
  // تحديد الدور المتوقع منه القرار حسب الحالة الحالية للإذن
  // ============================================================
  private getExpectedRole(voucher: TreasuryVoucher): {
    role: RoleCode;
    step: ApprovalStep;
  } {
    switch (voucher.status) {
      case VoucherStatus.PENDING_FIRST_APPROVAL: {
        // للإيراد دايمًا مدير الإنتاج، للصرف حسب المسار اللي اختاره المحاسب
        const role =
          voucher.voucherType === VoucherType.REVENUE
            ? RoleCode.PRODUCTION_MANAGER
            : voucher.approvalPath === ApprovalPath.ADMIN_MANAGER
              ? RoleCode.ADMIN_MANAGER
              : RoleCode.PRODUCTION_MANAGER;
        return { role, step: ApprovalStep.FIRST_APPROVAL };
      }
      case VoucherStatus.PENDING_FINANCIAL_REVIEW:
        return { role: RoleCode.FINANCIAL_MANAGER, step: ApprovalStep.FINANCIAL_REVIEW };
      case VoucherStatus.PENDING_GM_APPROVAL:
        return { role: RoleCode.GENERAL_MANAGER, step: ApprovalStep.GM_APPROVAL };
      default:
        throw new BadRequestException('الإذن مش في خطوة اعتماد حاليًا');
    }
  }

  // ============================================================
  // اتخاذ قرار (موافقة / رفض) في أي خطوة من خطوات الاعتماد
  // ============================================================
  async decide(id: number, dto: DecisionDto, currentUser: CurrentUserPayload) {
    const voucher = await this.findOneOrFail(id);

    const isAdminManager = currentUser.roles.includes(RoleCode.ADMIN_MANAGER);
    const isProductionManager = currentUser.roles.includes(RoleCode.PRODUCTION_MANAGER);

    // المدير الإداري يعتمد بس الإذن الإدارية أو أذون المحافظ
    if (isAdminManager && voucher.approvalPath !== ApprovalPath.ADMIN_MANAGER && !voucher.wallet) {
      throw new ForbiddenException('لا يحق لك اعتماد هذا الإذن');
    }

    // المدير الإنتاجي يعتمد بس الإذن الإنتاجية أو أذون المحافظ
    if (isProductionManager && voucher.approvalPath !== ApprovalPath.PRODUCTION_MANAGER && !voucher.wallet) {
      throw new ForbiddenException('لا يحق لك اعتماد هذا الإذن');
    }

    const { role, step } = this.getExpectedRole(voucher);

    // صاحب الدور المطلوب للخطوة دي، أو صاحب صلاحية كاملة (مدير النظام / المدير المالي)
    const hasFullAccess = currentUser.roles.some((r) => FULL_ACCESS_ROLES.includes(r));
    if (!hasFullAccess && !currentUser.roles.includes(role)) {
      throw new ForbiddenException('مش من صلاحياتك تاخد قرار في الخطوة دي');
    }

    return this.dataSource.transaction(async (manager) => {
      await manager.save(
        manager.create(VoucherApproval, {
          voucher: { id: voucher.id } as any,
          step,
          approver: { id: currentUser.userId } as any,
          decision: dto.decision,
          comment: dto.comment,
        }),
      );

      if (dto.decision === ApprovalDecision.REJECTED) {
        voucher.status = VoucherStatus.REJECTED;
      } else {
        const workflow = await this.workflowSettingsRepo.findOne({ where: {} });
        const requireFinancialReview = workflow?.requireFinancialReview ?? true;
        const requireGmApproval = workflow?.requireGmApproval ?? true;

        // الانتقال للخطوة التالية حسب الخطوة الحالية، وبنتخطى أي خطوة متقفلة من الإعدادات
        if (step === ApprovalStep.FIRST_APPROVAL) {
          if (requireFinancialReview) voucher.status = VoucherStatus.PENDING_FINANCIAL_REVIEW;
          else if (requireGmApproval) voucher.status = VoucherStatus.PENDING_GM_APPROVAL;
          else voucher.status = VoucherStatus.APPROVED_FINAL;
        } else if (step === ApprovalStep.FINANCIAL_REVIEW) {
          if (requireGmApproval) voucher.status = VoucherStatus.PENDING_GM_APPROVAL;
          else voucher.status = VoucherStatus.APPROVED_FINAL;
        } else if (step === ApprovalStep.GM_APPROVAL) {
          voucher.status = VoucherStatus.APPROVED_FINAL;
        }
      }

      return manager.save(voucher);
    });
  }

  // ============================================================
  // الصرف/التحصيل الفعلي - محاسب الخزينة بس، وبيأثر على الأرصدة
  // ============================================================
  async disburse(id: number, currentUser: CurrentUserPayload) {
    const isAdminManager = currentUser.roles.includes(RoleCode.ADMIN_MANAGER);
    const isProductionManager = currentUser.roles.includes(RoleCode.PRODUCTION_MANAGER);

    // المدير الإداري والإنتاجي ممنوعين من الصرف الفعلي
    if (isAdminManager || isProductionManager) {
      throw new ForbiddenException('لا يحق لك الصرف الفعلي');
    }

    const hasFullAccess = currentUser.roles.some((r) => FULL_ACCESS_ROLES.includes(r));
    if (!hasFullAccess && !currentUser.roles.includes(RoleCode.TREASURY_ACCOUNTANT)) {
      throw new ForbiddenException('الصرف الفعلي من صلاحية محاسب الخزينة فقط');
    }

    const voucher = await this.findOneOrFail(id);
    if (voucher.status !== VoucherStatus.APPROVED_FINAL) {
      throw new BadRequestException('الإذن لازم يكون معتمد نهائيًا الأول');
    }

    return this.dataSource.transaction(async (manager) => {
      voucher.status = VoucherStatus.DISBURSED;
      voucher.disbursedBy = { id: currentUser.userId } as any;
      voucher.disbursedAt = new Date();
      await manager.save(voucher);

      await this.applyBalanceEffect(manager, voucher);

      await manager.save(
        manager.create(VoucherApproval, {
          voucher: { id: voucher.id } as any,
          step: ApprovalStep.DISBURSEMENT,
          approver: { id: currentUser.userId } as any,
          decision: ApprovalDecision.APPROVED,
        }),
      );

      return voucher;
    });
  }

  // ============================================================
  // تحديث رصيد الحساب المتأثر (خزينة رئيسية/فرع/بنك/محفظة)
  // ============================================================
  private async applyBalanceEffect(manager, voucher: TreasuryVoucher, direction: 1 | -1 = 1) {
    let accountType: AccountKind;
    let accountId: number;

    if (voucher.bankAccount) {
      accountType = AccountKind.BANK;
      accountId = voucher.bankAccount.id;
    } else if (voucher.wallet) {
      accountType = AccountKind.WALLET;
      accountId = voucher.wallet.id;
    } else if (voucher.branch) {
      accountType = voucher.branch.isMain
        ? AccountKind.MAIN_TREASURY
        : AccountKind.BRANCH;
      accountId = voucher.branch.id;
    } else {
      return; // مفيش حساب محدد
    }

    let balance = await manager.findOne(AccountBalance, {
      where: { accountType, accountId },
    });

    if (!balance) {
      balance = manager.create(AccountBalance, {
        accountType,
        accountId,
        currentBalance: 0,
      });
    }

   const sign = (voucher.voucherType === VoucherType.REVENUE ? 1 : -1) * direction;
    balance.currentBalance = Number(balance.currentBalance) + sign * Number(voucher.totalAmount);

    await manager.save(balance);
  }

  // ============================================================
  // تكرار إذن قائم (بيعمل مسودة جديدة بنفس البيانات)
  // ============================================================
  async duplicate(id: number, currentUser: CurrentUserPayload) {
    const isAdminManager = currentUser.roles.includes(RoleCode.ADMIN_MANAGER);
    const isProductionManager = currentUser.roles.includes(RoleCode.PRODUCTION_MANAGER);

    // المدير الإداري والإنتاجي ممنوعين من التكرار
    if (isAdminManager || isProductionManager) {
      throw new ForbiddenException('لا يحق لك تكرار الإذن');
    }

    const original = await this.findOneOrFail(id);

    return this.dataSource.transaction(async (manager) => {
      const prefix = original.voucherType === VoucherType.EXPENSE ? 'EXP' : 'REV';
      const serialNumber = await this.serialNumberService.generate(
        manager,
        original.voucherType,
        prefix,
      );

      const copy = manager.create(TreasuryVoucher, {
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
        status: VoucherStatus.DRAFT,
        totalAmount: original.totalAmount,
        createdBy: { id: currentUser.userId } as any,
        duplicatedFrom: { id: original.id } as any,
        lines: original.lines.map((l) =>
          manager.create(VoucherLine, {
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
          }),
        ),
      });

      return manager.save(copy);
    });
  }

  // ============================================================
  // تعديل إذن (مسودة أو مرفوض فقط - أو محاسب الخزينة/المدير المالي بصلاحية موسعة)
  // ============================================================
  async update(id: number, dto: UpdateVoucherDto, currentUser: CurrentUserPayload) {
    const voucher = await this.findOneOrFail(id);

    const isAdminManager = currentUser.roles.includes(RoleCode.ADMIN_MANAGER);
    const isProductionManager = currentUser.roles.includes(RoleCode.PRODUCTION_MANAGER);

    // المدير الإداري يعدل بس الإذن الإدارية أو أذون المحافظ
    if (isAdminManager && voucher.approvalPath !== ApprovalPath.ADMIN_MANAGER && !voucher.wallet) {
      throw new ForbiddenException('لا يحق لك تعديل هذا الإذن');
    }

    // المدير الإنتاجي يعدل بس الإذن الإنتاجية أو أذون المحافظ
    if (isProductionManager && voucher.approvalPath !== ApprovalPath.PRODUCTION_MANAGER && !voucher.wallet) {
      throw new ForbiddenException('لا يحق لك تعديل هذا الإذن');
    }

    // لا يعدل بعد الاعتماد (للمدير الإداري والإنتاجي)
    if ((isAdminManager || isProductionManager) &&
        (voucher.status === VoucherStatus.APPROVED_FINAL || voucher.status === VoucherStatus.DISBURSED)) {
      throw new ForbiddenException('لا يمكن تعديل الإذن بعد الاعتماد');
    }

    const isPrivileged =
      currentUser.roles.some((r) => FULL_ACCESS_ROLES.includes(r)) ||
      currentUser.roles.includes(RoleCode.TREASURY_ACCOUNTANT);

    const isEditableStatus =
      voucher.status === VoucherStatus.DRAFT ||
      voucher.status === VoucherStatus.REJECTED;

    if (!isEditableStatus && !isPrivileged) {
      throw new ForbiddenException('الإذن ده مش قابل للتعديل في الحالة دي');
    }

    return this.dataSource.transaction(async (manager) => {
      // نلقط "قبل التعديل" عشان لو الإذن كان مصروف فعلاً نقدر نعكس أثره القديم بالظبط
      const wasDisbursed = voucher.status === VoucherStatus.DISBURSED;
      const before = {
        bankAccount: voucher.bankAccount,
        wallet: voucher.wallet,
        branch: voucher.branch,
        totalAmount: voucher.totalAmount,
        voucherType: voucher.voucherType,
      } as TreasuryVoucher;

      Object.assign(voucher, {
        voucherDate: dto.voucherDate ?? voucher.voucherDate,
        notes: dto.notes ?? voucher.notes,
        paymentMethod: dto.paymentMethod ?? voucher.paymentMethod,
        branch: dto.branchId !== undefined ? ({ id: dto.branchId } as any) : voucher.branch,
        bankAccount:
          dto.bankAccountId !== undefined ? ({ id: dto.bankAccountId } as any) : voucher.bankAccount,
        wallet: dto.walletId !== undefined ? ({ id: dto.walletId } as any) : voucher.wallet,
        approvalPath: dto.approvalPath ?? voucher.approvalPath,
      });

      // لو اتبعتت بنود جديدة، نستبدل البنود القديمة بالكامل ونعيد حساب الإجمالي
      if (dto.lines) {
        await manager.delete(VoucherLine, { voucher: { id: voucher.id } });
        voucher.lines = dto.lines.map((l) =>
          manager.create(VoucherLine, {
            voucher: { id: voucher.id } as any,
            lineType: l.lineType,
            mainCategory: l.mainCategoryId ? ({ id: l.mainCategoryId } as any) : null,
            subCategory: l.subCategoryId ? ({ id: l.subCategoryId } as any) : null,
            costCenter: l.costCenterId ? ({ id: l.costCenterId } as any) : null,
            employee: l.employeeId ? ({ id: l.employeeId } as any) : null,
            vehicle: l.vehicleId ? ({ id: l.vehicleId } as any) : null,
            vendor: l.vendorId ? ({ id: l.vendorId } as any) : null,
            customer: l.customerId ? ({ id: l.customerId } as any) : null,
            amount: l.amount,
            description: l.description,
          }),
        );
        voucher.totalAmount = dto.lines.reduce((sum, l) => sum + l.amount, 0);
      }

      // لو اتعدل وهو مرفوض، ده بيرجعه مسودة تاني لحد ما يترسل من جديد صراحة
      if (voucher.status === VoucherStatus.REJECTED) {
        voucher.status = VoucherStatus.DRAFT;
      }

      const saved = await manager.save(voucher);

      // لو الإذن كان مصروف/محصّل فعلاً قبل التعديل: نعكس أثره القديم بالظبط ونطبق الجديد
      // (كده الرصيد بيفضل صح حتى لو اتغير المبلغ أو الحساب نفسه)
      if (wasDisbursed) {
        await this.applyBalanceEffect(manager, before, -1);
        await this.applyBalanceEffect(manager, saved, 1);
      }

      return saved;
    });
  }

  // ============================================================
  // حذف (Soft Delete) - قاعدة صارمة ومتفق عليها:
  // المحاسب: يحذف بس المسودة (draft) اللي هو نفسه اللي عملها
  // مدير النظام (system_admin): يحذف أي إذن في أي حالة
  // أي حد تاني (مدير مالي، محاسب خزينة، مدير إداري/إنتاجي...): مالوش صلاحية حذف خالص
  // ============================================================
  async softDelete(id: number, currentUser: CurrentUserPayload) {
    const voucher = await this.findOneOrFail(id);

    const isSystemAdmin = currentUser.roles.includes(RoleCode.SYSTEM_ADMIN);
    const isOwnDraft =
      currentUser.roles.includes(RoleCode.ACCOUNTANT) &&
      voucher.status === VoucherStatus.DRAFT &&
      voucher.createdBy?.id === currentUser.userId;

    if (!isSystemAdmin && !isOwnDraft) {
      throw new ForbiddenException(
        'مش من صلاحياتك حذف الإذن ده - المحاسب يقدر يحذف بس المسودة اللي عملها بنفسه، ومدير النظام بس اللي يحذف أي إذن في أي حالة',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      // لو الإذن كان اتصرف/اتحصّل فعلاً (أثّر على رصيد حقيقي)، نعكس نفس الأثر قبل الحذف
      if (voucher.status === VoucherStatus.DISBURSED) {
        await this.applyBalanceEffect(manager, voucher, -1);
      }

      voucher.isDeleted = true;
      return manager.save(voucher);
    });
  }

  // ============================================================
  // استعلامات القراءة
  // ============================================================
  async findAll(
    filters: { status?: VoucherStatus; voucherType?: VoucherType },
    currentUser: CurrentUserPayload,
  ) {
    const qb = this.voucherRepo
      .createQueryBuilder('voucher')
      .leftJoinAndSelect('voucher.lines', 'lines')
      .leftJoinAndSelect('voucher.currency', 'currency')
      .leftJoinAndSelect('voucher.branch', 'branch')
      .leftJoinAndSelect('voucher.bankAccount', 'bankAccount')
      .leftJoinAndSelect('voucher.wallet', 'wallet')
      .leftJoinAndSelect('voucher.createdBy', 'createdBy')
      .where('voucher.isDeleted = :isDeleted', { isDeleted: false });

    const isAdminManager = currentUser.roles.includes(RoleCode.ADMIN_MANAGER);
    const isProductionManager = currentUser.roles.includes(RoleCode.PRODUCTION_MANAGER);

    if (isAdminManager) {
      // المدير الإداري: أذون الصرف الإدارية + أذون المحافظ (ما عدا المسودة)
      qb.andWhere(
        '((voucher.approvalPath = :adminPath AND voucher.voucherType = :expense) OR (wallet.id IS NOT NULL))',
        { adminPath: ApprovalPath.ADMIN_MANAGER, expense: VoucherType.EXPENSE },
      );
      qb.andWhere('voucher.status != :draft', { draft: VoucherStatus.DRAFT });
    } else if (isProductionManager) {
      // المدير الإنتاجي: أذون الصرف الإنتاجية + أذون المحافظ (ما عدا المسودة)
      qb.andWhere(
        '((voucher.approvalPath = :prodPath AND voucher.voucherType = :expense) OR (wallet.id IS NOT NULL))',
        { prodPath: ApprovalPath.PRODUCTION_MANAGER, expense: VoucherType.EXPENSE },
      );
      qb.andWhere('voucher.status != :draft', { draft: VoucherStatus.DRAFT });
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

  async findOneOrFail(id: number): Promise<TreasuryVoucher> {
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

    if (!voucher) throw new NotFoundException('الإذن غير موجود');
    return voucher;
  }

  async getApprovalHistory(id: number) {
    await this.findOneOrFail(id);
    return this.approvalRepo.find({
      where: { voucher: { id } },
      relations: ['approver'],
      order: { decidedAt: 'ASC' },
    });
  }
}
