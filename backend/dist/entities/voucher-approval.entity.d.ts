import { TreasuryVoucher } from './treasury-voucher.entity';
import { User } from './user.entity';
export declare enum ApprovalStep {
    FIRST_APPROVAL = "first_approval",
    FINANCIAL_REVIEW = "financial_review",
    GM_APPROVAL = "gm_approval",
    DISBURSEMENT = "disbursement"
}
export declare enum ApprovalDecision {
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class VoucherApproval {
    id: number;
    voucher: TreasuryVoucher;
    step: ApprovalStep;
    approver: User;
    decision: ApprovalDecision;
    comment: string;
    decidedAt: Date;
}
