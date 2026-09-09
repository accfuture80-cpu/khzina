import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserPayload } from '../vouchers/vouchers.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '../../entities/role.entity';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @Roles(RoleCode.ACCOUNTANT, RoleCode.TREASURY_ACCOUNTANT)
  create(@Body() dto: CreateTransferDto, @CurrentUser() user: CurrentUserPayload) {
    return this.transfersService.create(dto, user);
  }

  @Get()
  findAll() {
    return this.transfersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transfersService.findOneOrFail(id);
  }

  @Post(':id/approve')
  @Roles(RoleCode.FINANCIAL_MANAGER)
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.transfersService.approve(id, user);
  }

  @Post(':id/execute')
  @Roles(RoleCode.TREASURY_ACCOUNTANT)
  execute(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.transfersService.execute(id, user);
  }
}
