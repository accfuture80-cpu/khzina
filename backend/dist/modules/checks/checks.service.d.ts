import { Repository } from 'typeorm';
import { Check, CheckStatus } from '../../entities/check.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Customer } from '../../entities/customer.entity';
import { CreateCheckDto } from './dto/create-check.dto';
export declare class ChecksService {
    private readonly checkRepo;
    private readonly vendorRepo;
    private readonly customerRepo;
    constructor(checkRepo: Repository<Check>, vendorRepo: Repository<Vendor>, customerRepo: Repository<Customer>);
    findAll(): Promise<Check[]>;
    findOneOrFail(id: number): Promise<Check>;
    create(dto: CreateCheckDto): Promise<Check>;
    updateStatus(id: number, status: CheckStatus): Promise<Check>;
    remove(id: number): Promise<void>;
    getDashboardTotals(): Promise<{
        overdueChecksAmount: number;
        overdueChecksCount: number;
        upcomingChecksAmount: number;
        upcomingChecksCount: number;
    }>;
    importChecksFromExcel(buffer: Buffer): Promise<{
        imported: number;
        skippedCodesNotFound: string[];
    }>;
    private normalizeExcelDate;
}
