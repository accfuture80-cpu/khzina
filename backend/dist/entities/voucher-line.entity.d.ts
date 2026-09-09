import { TreasuryVoucher } from './treasury-voucher.entity';
import { ExpenseCategoryMain } from './expense-category-main.entity';
import { ExpenseCategorySub } from './expense-category-sub.entity';
import { CostCenter } from './cost-center.entity';
import { Employee } from './employee.entity';
import { Vehicle } from './vehicle.entity';
import { Vendor } from './vendor.entity';
import { Customer } from './customer.entity';
export declare enum VoucherLineType {
    EXPENSE = "expense",
    CUSTODY_ADVANCE = "custody_advance",
    VENDOR_PAYMENT = "vendor_payment",
    OTHER_REVENUE = "other_revenue",
    CUSTOMER_COLLECTION = "customer_collection",
    CUSTODY_REPAYMENT = "custody_repayment",
    BANK_COMMISSION = "bank_commission",
    TRANSFER = "transfer",
    TREASURY_FUNDING = "treasury_funding"
}
export declare class VoucherLine {
    id: number;
    voucher: TreasuryVoucher;
    lineType: VoucherLineType;
    mainCategory: ExpenseCategoryMain;
    subCategory: ExpenseCategorySub;
    costCenter: CostCenter;
    employee: Employee;
    vehicle: Vehicle;
    vendor: Vendor;
    customer: Customer;
    amount: number;
    description: string;
    createdAt: Date;
}
