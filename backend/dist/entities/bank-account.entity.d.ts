import { Currency } from './currency.entity';
export declare class BankAccount {
    id: number;
    code: string;
    bankName: string;
    branchName: string;
    accountNumber: string;
    responsiblePerson: string;
    currency: Currency;
    openingBalance: number;
    isActive: boolean;
    createdAt: Date;
}
