import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { VouchersService, CurrentUserPayload } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { DecisionDto } from './dto/decision.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '../../entities/role.entity';
import { VoucherStatus, VoucherType } from '../../entities/treasury-voucher.entity';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @Roles(RoleCode.ACCOUNTANT, RoleCode.ADMIN_MANAGER, RoleCode.PRODUCTION_MANAGER)
  create(@Body() dto: CreateVoucherDto, @CurrentUser() user: CurrentUserPayload) {
    return this.vouchersService.create(dto, user);
  }

 @Get()
findAll(
  @CurrentUser() user: CurrentUserPayload,
  @Query('status') status?: VoucherStatus,
  @Query('voucherType') voucherType?: VoucherType,
) {
  return this.vouchersService.findAll({ status, voucherType }, user);
}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vouchersService.findOneOrFail(id);
  }

  @Get(':id/approvals')
  getApprovalHistory(@Param('id', ParseIntPipe) id: number) {
    return this.vouchersService.getApprovalHistory(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVoucherDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.vouchersService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.vouchersService.softDelete(id, user);
  }

  @Post(':id/submit')
  @Roles(RoleCode.ACCOUNTANT, RoleCode.ADMIN_MANAGER, RoleCode.PRODUCTION_MANAGER)
  submit(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.vouchersService.submit(id, user);
  }

  // مفتوح لأي مستخدم مسجل دخول - الخدمة نفسها بتتأكد إن الدور مطابق للخطوة الحالية
  @Post(':id/decide')
  decide(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DecisionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.vouchersService.decide(id, dto, user);
  }

  @Post(':id/disburse')
  @Roles(RoleCode.TREASURY_ACCOUNTANT)
  disburse(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.vouchersService.disburse(id, user);
  }

  @Post(':id/duplicate')
  @Roles(RoleCode.ACCOUNTANT, RoleCode.TREASURY_ACCOUNTANT, RoleCode.FINANCIAL_MANAGER, RoleCode.SYSTEM_ADMIN)
  duplicate(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.vouchersService.duplicate(id, user);
  }
}
