import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CurrentUserPayload } from '../vouchers/vouchers.service';
export declare class TransfersController {
    private readonly transfersService;
    constructor(transfersService: TransfersService);
    create(dto: CreateTransferDto, user: CurrentUserPayload): Promise<import("../../entities/treasury-transfer.entity").TreasuryTransfer>;
    findAll(): Promise<import("../../entities/treasury-transfer.entity").TreasuryTransfer[]>;
    findOne(id: number): Promise<import("../../entities/treasury-transfer.entity").TreasuryTransfer>;
    approve(id: number, user: CurrentUserPayload): Promise<import("../../entities/treasury-transfer.entity").TreasuryTransfer>;
    execute(id: number, user: CurrentUserPayload): Promise<import("../../entities/treasury-transfer.entity").TreasuryTransfer>;
}
