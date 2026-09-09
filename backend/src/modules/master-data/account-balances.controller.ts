import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountBalance } from '../../entities/account-balance.entity';

@Controller('account-balances')
export class AccountBalancesController {
  constructor(
    @InjectRepository(AccountBalance)
    private readonly repo: Repository<AccountBalance>,
  ) {}

  @Get()
  findAll() {
    return this.repo.find();
  }
}
