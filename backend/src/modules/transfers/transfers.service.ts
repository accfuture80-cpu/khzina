import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  TreasuryTransfer,
  TransferStatus,
} from '../../entities/treasury-transfer.entity';
import { AccountBalance } from '../../entities/account-balance.entity';
import { RoleCode } from '../../entities/role.entity';
import { FULL_ACCESS_ROLES } from '../auth/guards/roles.guard';
import { SerialNumberService } from '../common/serial-number.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CurrentUserPayload } from '../vouchers/vouchers.service';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(TreasuryTransfer)
    private readonly transferRepo: Repository<TreasuryTransfer>,
    private readonly dataSource: DataSource,
    private readonly serialNumberService: SerialNumberService,
  ) {}

  async create(dto: CreateTransferDto, currentUser: CurrentUserPayload) {
    if (dto.fromType === dto.toType && dto.fromId === dto.toId) {
      throw new BadRequestException('لازم يكون الحساب المُحوَّل منه غير المُحوَّل إليه');
    }

    return this.dataSource.transaction(async (manager) => {
      const serialNumber = await this.serialNumberService.generate(
        manager,
        'transfer',
        'TRF',
      );

      const transfer = manager.create(TreasuryTransfer, {
        serialNumber,
        transferDate: dto.transferDate,
        fromType: dto.fromType,
        fromId: dto.fromId,
        toType: dto.toType,
        toId: dto.toId,
        amount: dto.amount,
        commissionAmount: dto.commissionAmount ?? 0,
        status: TransferStatus.PENDING,
        createdBy: { id: currentUser.userId } as any,
      });

      return manager.save(transfer);
    });
  }

  // اعتماد التحويل - المدير المالي
  async approve(id: number, currentUser: CurrentUserPayload) {
    const hasFullAccess = currentUser.roles.some((r) => FULL_ACCESS_ROLES.includes(r));
    if (!hasFullAccess && !currentUser.roles.includes(RoleCode.FINANCIAL_MANAGER)) {
      throw new ForbiddenException('اعتماد التحويل من صلاحية المدير المالي فقط');
    }

    const transfer = await this.findOneOrFail(id);
    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('التحويل ده اتاعتمد أو اتنفذ قبل كده');
    }

    transfer.status = TransferStatus.APPROVED;
    return this.transferRepo.save(transfer);
  }

  // التنفيذ الفعلي - محاسب الخزينة، وبيأثر على رصيد الحسابين
  async execute(id: number, currentUser: CurrentUserPayload) {
    const hasFullAccess = currentUser.roles.some((r) => FULL_ACCESS_ROLES.includes(r));
    if (!hasFullAccess && !currentUser.roles.includes(RoleCode.TREASURY_ACCOUNTANT)) {
      throw new ForbiddenException('تنفيذ التحويل من صلاحية محاسب الخزينة فقط');
    }

    const transfer = await this.findOneOrFail(id);
    if (transfer.status !== TransferStatus.APPROVED) {
      throw new BadRequestException('التحويل لازم يكون معتمد الأول');
    }

    return this.dataSource.transaction(async (manager) => {
      // خصم المبلغ + العمولة من الحساب المُحوَّل منه
      const fromBalance = await this.getOrCreateBalance(
        manager,
        transfer.fromType,
        transfer.fromId,
      );
      fromBalance.currentBalance =
        Number(fromBalance.currentBalance) -
        (Number(transfer.amount) + Number(transfer.commissionAmount));
      await manager.save(fromBalance);

      // إضافة المبلغ (بدون العمولة) للحساب المُحوَّل إليه
      const toBalance = await this.getOrCreateBalance(
        manager,
        transfer.toType,
        transfer.toId,
      );
      toBalance.currentBalance = Number(toBalance.currentBalance) + Number(transfer.amount);
      await manager.save(toBalance);

      transfer.status = TransferStatus.EXECUTED;
      return manager.save(transfer);
    });
  }

  private async getOrCreateBalance(manager, accountType, accountId) {
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
    return balance;
  }

  async findAll() {
    return this.transferRepo.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneOrFail(id: number): Promise<TreasuryTransfer> {
    const transfer = await this.transferRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!transfer) throw new NotFoundException('التحويل غير موجود');
    return transfer;
  }
}
