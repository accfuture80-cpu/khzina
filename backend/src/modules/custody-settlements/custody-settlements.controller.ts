import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CustodySettlementsService } from './custody-settlements.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserPayload } from '../vouchers/vouchers.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '../../entities/role.entity';

@Controller('custody-settlements')
export class CustodySettlementsController {
  constructor(private readonly settlementsService: CustodySettlementsService) {}

  @Post()
  @Roles(RoleCode.ACCOUNTANT)
  create(@Body() dto: CreateSettlementDto, @CurrentUser() user: CurrentUserPayload) {
    return this.settlementsService.create(dto, user);
  }

  @Get()
  findAll() {
    return this.settlementsService.findAll();
  }

  @Get('available-custody-lines')
  getAvailableCustodyLines() {
    return this.settlementsService.getAvailableCustodyLines();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.settlementsService.findOneOrFail(id);
  }

  @Post(':id/approve')
  @Roles(RoleCode.FINANCIAL_MANAGER)
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.settlementsService.approve(id, user);
  }
}
