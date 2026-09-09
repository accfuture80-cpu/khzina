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
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '../../entities/role.entity';
import {
  BranchesService,
  CurrenciesService,
  BankAccountsService,
  EWalletsService,
  ExpenseCategoriesMainService,
  ExpenseCategoriesSubService,
  CostCentersService,
  EmployeesService,
  VehiclesService,
  VendorsService,
  CustomersService,
} from './master-data.services';

// كل الجداول دي بيقدر يضيف/يعدل فيها المحاسب أو محاسب الخزينة بس
const CAN_MANAGE = [RoleCode.ACCOUNTANT, RoleCode.TREASURY_ACCOUNTANT];

@Controller('branches')
export class BranchesController {
  constructor(private readonly service: BranchesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneOrFail(id); }
  @Post() @Roles(...CAN_MANAGE) create(@Body() dto: any) { return this.service.create(dto); }
  @Patch(':id') @Roles(...CAN_MANAGE) update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(...CAN_MANAGE) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly service: CurrenciesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneOrFail(id); }
  @Post() @Roles(...CAN_MANAGE) create(@Body() dto: any) { return this.service.create(dto); }
  @Patch(':id') @Roles(...CAN_MANAGE) update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(...CAN_MANAGE) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly service: BankAccountsService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneOrFail(id); }
  @Post() @Roles(...CAN_MANAGE) create(@Body() dto: any) { return this.service.create(dto); }
  @Patch(':id') @Roles(...CAN_MANAGE) update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(...CAN_MANAGE) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('e-wallets')
export class EWalletsController {
  constructor(private readonly service: EWalletsService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneOrFail(id); }
  @Post() @Roles(...CAN_MANAGE) create(@Body() dto: any) { return this.service.create(dto); }
  @Patch(':id') @Roles(...CAN_MANAGE) update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(...CAN_MANAGE) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('expense-categories-main')
export class ExpenseCategoriesMainController {
  constructor(private readonly service: ExpenseCategoriesMainService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneOrFail(id); }
  @Post() @Roles(...CAN_MANAGE) create(@Body() dto: any) { return this.service.create(dto); }
  @Patch(':id') @Roles(...CAN_MANAGE) update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(...CAN_MANAGE) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('expense-categories-sub')
export class ExpenseCategoriesSubController {
  constructor(private readonly service: ExpenseCategoriesSubService) {}

  // بيدعم فلترة ?mainCategoryId=X عشان الـ Dropdown المتسلسل في الفرونت
  @Get()
  findAll(@Query('mainCategoryId') mainCategoryId?: string) {
    if (mainCategoryId) {
      return this.service.findByMainCategory(parseInt(mainCategoryId, 10));
    }
    return this.service.findAll();
  }

  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneOrFail(id); }
  @Post() @Roles(...CAN_MANAGE) create(@Body() dto: any) { return this.service.create(dto); }
  @Patch(':id') @Roles(...CAN_MANAGE) update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(...CAN_MANAGE) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly service: CostCentersService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneOrFail(id); }
  @Post() @Roles(...CAN_MANAGE) create(@Body() dto: any) { return this.service.create(dto); }
  @Patch(':id') @Roles(...CAN_MANAGE) update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(...CAN_MANAGE) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('employees')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneOrFail(id); }
  @Post() @Roles(...CAN_MANAGE) create(@Body() dto: any) { return this.service.create(dto); }
  @Patch(':id') @Roles(...CAN_MANAGE) update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(...CAN_MANAGE) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneOrFail(id); }
  @Post() @Roles(...CAN_MANAGE) create(@Body() dto: any) { return this.service.create(dto); }
  @Patch(':id') @Roles(...CAN_MANAGE) update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(...CAN_MANAGE) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('vendors')
export class VendorsController {
  constructor(private readonly service: VendorsService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneOrFail(id); }
  @Post() @Roles(...CAN_MANAGE) create(@Body() dto: any) { return this.service.create(dto); }
  @Patch(':id') @Roles(...CAN_MANAGE) update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(...CAN_MANAGE) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneOrFail(id); }
  @Post() @Roles(...CAN_MANAGE) create(@Body() dto: any) { return this.service.create(dto); }
  @Patch(':id') @Roles(...CAN_MANAGE) update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(...CAN_MANAGE) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
