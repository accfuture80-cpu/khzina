import { AccountKind } from '../../../entities/treasury-transfer.entity';
export declare class CreateTransferDto {
    transferDate: string;
    fromType: AccountKind;
    fromId: number;
    toType: AccountKind;
    toId: number;
    amount: number;
    commissionAmount?: number;
}
