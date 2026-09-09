import { Repository } from 'typeorm';
import { AccountBalance } from '../../entities/account-balance.entity';
export declare class AccountBalancesController {
    private readonly repo;
    constructor(repo: Repository<AccountBalance>);
    findAll(): Promise<AccountBalance[]>;
}
