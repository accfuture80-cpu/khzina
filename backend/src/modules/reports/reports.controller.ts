import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AccountKind } from '../../entities/treasury-transfer.entity';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('account-statement')
  getAccountStatement(
    @Query('accountType') accountType: AccountKind,
    @Query('accountId') accountId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    if (!accountType || !accountId) {
      throw new BadRequestException('لازم تحدد نوع الحساب ورقمه');
    }
    return this.reportsService.getAccountStatement(
      accountType,
      parseInt(accountId, 10),
      fromDate,
      toDate,
    );
  }

  @Get('vendors-statement')
  getVendorsStatement(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    return this.reportsService.getVendorsStatement(fromDate, toDate);
  }

  @Get('customers-statement')
  getCustomersStatement(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    return this.reportsService.getCustomersStatement(fromDate, toDate);
  }

  @Get('custody-settlements-statement')
  getCustodySettlementsStatement(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.reportsService.getCustodySettlementsStatement(fromDate, toDate);
  }

  @Get('expenses-report')
  getExpensesReport(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    return this.reportsService.getExpensesReport(fromDate, toDate);
  }
}
