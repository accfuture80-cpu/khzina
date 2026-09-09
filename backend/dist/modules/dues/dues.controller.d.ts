import { DuesService } from './dues.service';
export declare class DuesController {
    private readonly duesService;
    constructor(duesService: DuesService);
    findAllVendorDues(): Promise<import("../../entities/vendor-due.entity").VendorDue[]>;
    findAllCustomerDues(): Promise<import("../../entities/customer-due.entity").CustomerDue[]>;
    getDashboardTotals(): Promise<{
        totalVendorDues: number;
        vendorDuesCount: number;
        totalCustomerDues: number;
        customerDuesCount: number;
    }>;
    importVendorDues(file: Express.Multer.File): Promise<{
        imported: number;
        skipped: number;
        notFoundCodes: string[];
    }>;
    importCustomerDues(file: Express.Multer.File): Promise<{
        imported: number;
        skipped: number;
        notFoundCodes: string[];
    }>;
    markVendorDuePaid(id: number): Promise<import("../../entities/vendor-due.entity").VendorDue>;
    markCustomerDuePaid(id: number): Promise<import("../../entities/customer-due.entity").CustomerDue>;
}
