import { ChecksService } from './checks.service';
import { CreateCheckDto } from './dto/create-check.dto';
export declare class ChecksController {
    private readonly checksService;
    constructor(checksService: ChecksService);
    findAll(): Promise<import("../../entities/check.entity").Check[]>;
    getDashboardTotals(): Promise<{
        overdueChecksAmount: number;
        overdueChecksCount: number;
        upcomingChecksAmount: number;
        upcomingChecksCount: number;
    }>;
    findOne(id: number): Promise<import("../../entities/check.entity").Check>;
    create(dto: CreateCheckDto): Promise<import("../../entities/check.entity").Check>;
    importChecks(file: Express.Multer.File): Promise<{
        imported: number;
        skippedCodesNotFound: string[];
    }>;
    markCollected(id: number): Promise<import("../../entities/check.entity").Check>;
    markBounced(id: number): Promise<import("../../entities/check.entity").Check>;
    remove(id: number): Promise<void>;
}
