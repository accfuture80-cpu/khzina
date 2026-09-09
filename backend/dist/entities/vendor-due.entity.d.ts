import { Vendor } from './vendor.entity';
export declare enum DueStatus {
    PENDING = "pending",
    PAID = "paid"
}
export declare class VendorDue {
    id: number;
    vendor: Vendor;
    invoiceNumber: string;
    dueDate: string;
    amount: number;
    description: string;
    status: DueStatus;
    importBatch: string;
    createdAt: Date;
}
