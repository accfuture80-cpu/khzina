import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherSequence } from '../../entities/voucher-sequence.entity';
import { SerialNumberService } from './serial-number.service';

@Module({
  imports: [TypeOrmModule.forFeature([VoucherSequence])],
  providers: [SerialNumberService],
  exports: [SerialNumberService],
})
export class CommonModule {}
