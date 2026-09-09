import { Currency } from './currency.entity';
import { Branch } from './branch.entity';
import { BankAccount } from './bank-account.entity';
import { EWallet } from './e-wallet.entity';
import { User } from './user.entity';
import { VoucherLine } from './voucher-line.entity';
export declare enum VoucherType {
    EXPENSE = "expense",
    REVENUE = "revenue"
}
export declare enum PaymentMethod {
    CASH = "cash",
    BANK = "bank",
    WALLET = "wallet"
}
export declare enum ApprovalPath {
    ADMIN_MANAGER = "admin_manager",
    PRODUCTION_MANAGER = "production_manager"
}
export declare enum VoucherStatus {
    DRAFT = "draft",
    PENDING_FIRST_APPROVAL = "pending_first_approval",
    PENDING_FINANCIAL_REVIEW = "pending_financial_review",
    PENDING_GM_APPROVAL = "pending_gm_approval",
    APPROVED_FINAL = "approved_final",
    DISBURSED = "disbursed",
    REJECTED = "rejected"
}
export declare class TreasuryVoucher {
    id: number;
    voucherType: VoucherType;
    serialNumber: string;
    voucherDate: string;
    currency: Currency;
    paymentMethod: PaymentMethod;
    branch: Branch;
    bankAccount: BankAccount;
    wallet: EWallet;
    approvalPath: ApprovalPath;
    status: VoucherStatus;
    totalAmount: number;
    createdBy: User;
    notes: string;
    isDeleted: boolean;
    duplicatedFrom: TreasuryVoucher;
    disbursedBy: User;
    disbursedAt: Date;
    lines: VoucherLine[];
    createdAt: Date;
    updatedAt: Date;
}
