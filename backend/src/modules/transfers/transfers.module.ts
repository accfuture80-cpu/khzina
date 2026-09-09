import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreasuryTransfer } from '../../entities/treasury-transfer.entity';
import { AccountBalance } from '../../entities/account-balance.entity';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([TreasuryTransfer, AccountBalance]), CommonModule],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}
