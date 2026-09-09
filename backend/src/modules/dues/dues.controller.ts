import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DuesService } from './dues.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '../../entities/role.entity';

const CAN_MANAGE = [RoleCode.ACCOUNTANT, RoleCode.TREASURY_ACCOUNTANT, RoleCode.SYSTEM_ADMIN];

@Controller('dues')
export class DuesController {
  constructor(private readonly duesService: DuesService) {}

  @Get('vendors')
  findAllVendorDues() {
    return this.duesService.findAllVendorDues();
  }

  @Get('customers')
  findAllCustomerDues() {
    return this.duesService.findAllCustomerDues();
  }

  @Get('dashboard-totals')
  getDashboardTotals() {
    return this.duesService.getDashboardTotals();
  }

  @Post('vendors/import')
  @Roles(...CAN_MANAGE)
  @UseInterceptors(FileInterceptor('file'))
  async importVendorDues(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('لازم ترفع ملف إكسيل');
    return this.duesService.importVendorDues(file.buffer);
  }

  @Post('customers/import')
  @Roles(...CAN_MANAGE)
  @UseInterceptors(FileInterceptor('file'))
  async importCustomerDues(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('لازم ترفع ملف إكسيل');
    return this.duesService.importCustomerDues(file.buffer);
  }

  @Patch('vendors/:id/mark-paid')
  @Roles(...CAN_MANAGE)
  markVendorDuePaid(@Param('id', ParseIntPipe) id: number) {
    return this.duesService.markVendorDuePaid(id);
  }

  @Patch('customers/:id/mark-paid')
  @Roles(...CAN_MANAGE)
  markCustomerDuePaid(@Param('id', ParseIntPipe) id: number) {
    return this.duesService.markCustomerDuePaid(id);
  }
}
