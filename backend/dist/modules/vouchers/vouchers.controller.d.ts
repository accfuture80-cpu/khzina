import { VouchersService, CurrentUserPayload } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { DecisionDto } from './dto/decision.dto';
import { VoucherStatus, VoucherType } from '../../entities/treasury-voucher.entity';
export declare class VouchersController {
    private readonly vouchersService;
    constructor(vouchersService: VouchersService);
    create(dto: CreateVoucherDto, user: CurrentUserPayload): Promise<import("../../entities/treasury-voucher.entity").TreasuryVoucher>;
    findAll(user: CurrentUserPayload, status?: VoucherStatus, voucherType?: VoucherType): Promise<import("../../entities/treasury-voucher.entity").TreasuryVoucher[]>;
    findOne(id: number): Promise<import("../../entities/treasury-voucher.entity").TreasuryVoucher>;
    getApprovalHistory(id: number): Promise<import("../../entities/voucher-approval.entity").VoucherApproval[]>;
    update(id: number, dto: UpdateVoucherDto, user: CurrentUserPayload): Promise<import("../../entities/treasury-voucher.entity").TreasuryVoucher>;
    remove(id: number, user: CurrentUserPayload): Promise<import("../../entities/treasury-voucher.entity").TreasuryVoucher>;
    submit(id: number, user: CurrentUserPayload): Promise<import("../../entities/treasury-voucher.entity").TreasuryVoucher>;
    decide(id: number, dto: DecisionDto, user: CurrentUserPayload): Promise<import("../../entities/treasury-voucher.entity").TreasuryVoucher>;
    disburse(id: number, user: CurrentUserPayload): Promise<import("../../entities/treasury-voucher.entity").TreasuryVoucher>;
    duplicate(id: number, user: CurrentUserPayload): Promise<import("../../entities/treasury-voucher.entity").TreasuryVoucher>;
}
