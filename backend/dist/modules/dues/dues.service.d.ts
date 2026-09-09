import { DataSource, Repository } from 'typeorm';
import { VendorDue } from '../../entities/vendor-due.entity';
import { CustomerDue } from '../../entities/customer-due.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Customer } from '../../entities/customer.entity';
export declare class DuesService {
    private readonly vendorDueRepo;
    private readonly customerDueRepo;
    private readonly vendorRepo;
    private readonly customerRepo;
    private readonly dataSource;
    constructor(vendorDueRepo: Repository<VendorDue>, customerDueRepo: Repository<CustomerDue>, vendorRepo: Repository<Vendor>, customerRepo: Repository<Customer>, dataSource: DataSource);
    private parseExcelFile;
    private normalizeExcelDate;
    importVendorDues(buffer: Buffer): Promise<{
        imported: number;
        skipped: number;
        notFoundCodes: string[];
    }>;
    importCustomerDues(buffer: Buffer): Promise<{
        imported: number;
        skipped: number;
        notFoundCodes: string[];
    }>;
    findAllVendorDues(): Promise<VendorDue[]>;
    findAllCustomerDues(): Promise<CustomerDue[]>;
    markVendorDuePaid(id: number): Promise<VendorDue>;
    markCustomerDuePaid(id: number): Promise<CustomerDue>;
    getDashboardTotals(): Promise<{
        totalVendorDues: number;
        vendorDuesCount: number;
        totalCustomerDues: number;
        customerDuesCount: number;
    }>;
}
