import { User } from './user.entity';
export declare enum AccountKind {
    MAIN_TREASURY = "main_treasury",
    BRANCH = "branch",
    BANK = "bank",
    WALLET = "wallet"
}
export declare enum TransferStatus {
    PENDING = "pending",
    APPROVED = "approved",
    EXECUTED = "executed"
}
export declare class TreasuryTransfer {
    id: number;
    serialNumber: string;
    transferDate: string;
    fromType: AccountKind;
    fromId: number;
    toType: AccountKind;
    toId: number;
    amount: number;
    commissionAmount: number;
    status: TransferStatus;
    createdBy: User;
    createdAt: Date;
}
