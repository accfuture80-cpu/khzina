import { DataSource, Repository } from 'typeorm';
import { TreasuryTransfer } from '../../entities/treasury-transfer.entity';
import { SerialNumberService } from '../common/serial-number.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CurrentUserPayload } from '../vouchers/vouchers.service';
export declare class TransfersService {
    private readonly transferRepo;
    private readonly dataSource;
    private readonly serialNumberService;
    constructor(transferRepo: Repository<TreasuryTransfer>, dataSource: DataSource, serialNumberService: SerialNumberService);
    create(dto: CreateTransferDto, currentUser: CurrentUserPayload): Promise<TreasuryTransfer>;
    approve(id: number, currentUser: CurrentUserPayload): Promise<TreasuryTransfer>;
    execute(id: number, currentUser: CurrentUserPayload): Promise<TreasuryTransfer>;
    private getOrCreateBalance;
    findAll(): Promise<TreasuryTransfer[]>;
    findOneOrFail(id: number): Promise<TreasuryTransfer>;
}
