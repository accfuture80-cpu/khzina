import { DataSource, Repository } from 'typeorm';
import { TreasuryVoucher, VoucherStatus, VoucherType } from '../../entities/treasury-voucher.entity';
import { VoucherApproval } from '../../entities/voucher-approval.entity';
import { AccountBalance } from '../../entities/account-balance.entity';
import { WorkflowSettings } from '../../entities/workflow-settings.entity';
import { RoleCode } from '../../entities/role.entity';
import { SerialNumberService } from '../common/serial-number.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { DecisionDto } from './dto/decision.dto';
export interface CurrentUserPayload {
    userId: number;
    username: string;
    roles: RoleCode[];
}
export declare class VouchersService {
    private readonly voucherRepo;
    private readonly approvalRepo;
    private readonly balanceRepo;
    private readonly workflowSettingsRepo;
    private readonly dataSource;
    private readonly serialNumberService;
    constructor(voucherRepo: Repository<TreasuryVoucher>, approvalRepo: Repository<VoucherApproval>, balanceRepo: Repository<AccountBalance>, workflowSettingsRepo: Repository<WorkflowSettings>, dataSource: DataSource, serialNumberService: SerialNumberService);
    create(dto: CreateVoucherDto, currentUser: CurrentUserPayload): Promise<TreasuryVoucher>;
    submit(id: number, currentUser: CurrentUserPayload): Promise<TreasuryVoucher>;
    private getExpectedRole;
    decide(id: number, dto: DecisionDto, currentUser: CurrentUserPayload): Promise<TreasuryVoucher>;
    disburse(id: number, currentUser: CurrentUserPayload): Promise<TreasuryVoucher>;
    private applyBalanceEffect;
    duplicate(id: number, currentUser: CurrentUserPayload): Promise<TreasuryVoucher>;
    update(id: number, dto: UpdateVoucherDto, currentUser: CurrentUserPayload): Promise<TreasuryVoucher>;
    softDelete(id: number, currentUser: CurrentUserPayload): Promise<TreasuryVoucher>;
    findAll(filters: {
        status?: VoucherStatus;
        voucherType?: VoucherType;
    }, currentUser: CurrentUserPayload): Promise<TreasuryVoucher[]>;
    findOneOrFail(id: number): Promise<TreasuryVoucher>;
    getApprovalHistory(id: number): Promise<VoucherApproval[]>;
}
