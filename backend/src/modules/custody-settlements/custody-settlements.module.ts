import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustodySettlement } from '../../entities/custody-settlement.entity';
import { CustodySettlementLine } from '../../entities/custody-settlement-line.entity';
import { VoucherLine } from '../../entities/voucher-line.entity';
import { CustodySettlementsService } from './custody-settlements.service';
import { CustodySettlementsController } from './custody-settlements.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustodySettlement, CustodySettlementLine, VoucherLine]),
    CommonModule,
  ],
  controllers: [CustodySettlementsController],
  providers: [CustodySettlementsService],
})
export class CustodySettlementsModule {}
