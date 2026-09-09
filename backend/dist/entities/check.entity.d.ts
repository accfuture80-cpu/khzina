import { Vendor } from './vendor.entity';
import { Customer } from './customer.entity';
import { BankAccount } from './bank-account.entity';
export declare enum CheckDirection {
    RECEIVABLE = "receivable",
    PAYABLE = "payable"
}
export declare enum CheckStatus {
    PENDING = "pending",
    COLLECTED = "collected",
    BOUNCED = "bounced"
}
export declare class Check {
    id: number;
    checkNumber: string;
    direction: CheckDirection;
    vendor: Vendor;
    customer: Customer;
    bankAccount: BankAccount;
    bankName: string;
    dueDate: string;
    amount: number;
    status: CheckStatus;
    notes: string;
    createdAt: Date;
}
