import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreasuryVoucher } from '../../entities/treasury-voucher.entity';
import { VoucherLine } from '../../entities/voucher-line.entity';
import { VoucherApproval } from '../../entities/voucher-approval.entity';
import { AccountBalance } from '../../entities/account-balance.entity';
import { WorkflowSettings } from '../../entities/workflow-settings.entity';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TreasuryVoucher,
      VoucherLine,
      VoucherApproval,
      AccountBalance,
      WorkflowSettings,
    ]),
    CommonModule,
  ],
  controllers: [VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}
