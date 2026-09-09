import { VoucherType, PaymentMethod, ApprovalPath } from '../../../entities/treasury-voucher.entity';
import { VoucherLineDto } from './voucher-line.dto';
export declare class CreateVoucherDto {
    voucherType: VoucherType;
    voucherDate: string;
    currencyId: number;
    paymentMethod: PaymentMethod;
    branchId?: number;
    bankAccountId?: number;
    walletId?: number;
    approvalPath?: ApprovalPath;
    notes?: string;
    lines: VoucherLineDto[];
}
