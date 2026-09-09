import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorDue } from '../../entities/vendor-due.entity';
import { CustomerDue } from '../../entities/customer-due.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Customer } from '../../entities/customer.entity';
import { DuesService } from './dues.service';
import { DuesController } from './dues.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VendorDue, CustomerDue, Vendor, Customer])],
  controllers: [DuesController],
  providers: [DuesService],
})
export class DuesModule {}
