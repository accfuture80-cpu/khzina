import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreasuryVoucher } from '../../entities/treasury-voucher.entity';
import { TreasuryTransfer } from '../../entities/treasury-transfer.entity';
import { AccountBalance } from '../../entities/account-balance.entity';
import { VoucherLine } from '../../entities/voucher-line.entity';
import { CustodySettlement } from '../../entities/custody-settlement.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TreasuryVoucher,
      TreasuryTransfer,
      AccountBalance,
      VoucherLine,
      CustodySettlement,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
