import { Customer } from './customer.entity';
import { DueStatus } from './vendor-due.entity';
export declare class CustomerDue {
    id: number;
    customer: Customer;
    invoiceNumber: string;
    dueDate: string;
    amount: number;
    description: string;
    status: DueStatus;
    importBatch: string;
    createdAt: Date;
}
