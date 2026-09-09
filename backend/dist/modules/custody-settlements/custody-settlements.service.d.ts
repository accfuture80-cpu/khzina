import { DataSource, Repository } from 'typeorm';
import { CustodySettlement } from '../../entities/custody-settlement.entity';
import { VoucherLine } from '../../entities/voucher-line.entity';
import { SerialNumberService } from '../common/serial-number.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { CurrentUserPayload } from '../vouchers/vouchers.service';
export declare class CustodySettlementsService {
    private readonly settlementRepo;
    private readonly voucherLineRepo;
    private readonly dataSource;
    private readonly serialNumberService;
    constructor(settlementRepo: Repository<CustodySettlement>, voucherLineRepo: Repository<VoucherLine>, dataSource: DataSource, serialNumberService: SerialNumberService);
    create(dto: CreateSettlementDto, currentUser: CurrentUserPayload): Promise<CustodySettlement>;
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
    approve(id: number, currentUser: CurrentUserPayload): Promise<CustodySettlement>;
    findAll(): Promise<CustodySettlement[]>;
    findOneOrFail(id: number): Promise<CustodySettlement>;
}
