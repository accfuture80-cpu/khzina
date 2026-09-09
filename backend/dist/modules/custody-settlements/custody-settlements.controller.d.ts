import { CustodySettlementsService } from './custody-settlements.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { CurrentUserPayload } from '../vouchers/vouchers.service';
export declare class CustodySettlementsController {
    private readonly settlementsService;
    constructor(settlementsService: CustodySettlementsService);
    create(dto: CreateSettlementDto, user: CurrentUserPayload): Promise<import("../../entities/custody-settlement.entity").CustodySettlement>;
    findAll(): Promise<import("../../entities/custody-settlement.entity").CustodySettlement[]>;
    getAvailableCustodyLines(): Promise<{
        lineId: any;
        amount: number;
        settled: number;
        remaining: number;
        employeeId: any;
        employeeName: any;
        serialNumber: any;
        voucherDate: any;
    }[]>;
    findOne(id: number): Promise<import("../../entities/custody-settlement.entity").CustodySettlement>;
    approve(id: number, user: CurrentUserPayload): Promise<import("../../entities/custody-settlement.entity").CustodySettlement>;
}
