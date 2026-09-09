import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Check } from '../../entities/check.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Customer } from '../../entities/customer.entity';
import { ChecksService } from './checks.service';
import { ChecksController } from './checks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Check, Vendor, Customer])],
  controllers: [ChecksController],
  providers: [ChecksService],
})
export class ChecksModule {}
