import { AccountKind } from './treasury-transfer.entity';
export declare class AccountBalance {
    id: number;
    accountType: AccountKind;
    accountId: number;
    currentBalance: number;
    lastUpdated: Date;
}
