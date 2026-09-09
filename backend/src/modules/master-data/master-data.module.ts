import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../../entities/branch.entity';
import { Currency } from '../../entities/currency.entity';
import { BankAccount } from '../../entities/bank-account.entity';
import { EWallet } from '../../entities/e-wallet.entity';
import { ExpenseCategoryMain } from '../../entities/expense-category-main.entity';
import { ExpenseCategorySub } from '../../entities/expense-category-sub.entity';
import { CostCenter } from '../../entities/cost-center.entity';
import { Employee } from '../../entities/employee.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Customer } from '../../entities/customer.entity';
import { AccountBalance } from '../../entities/account-balance.entity';
import { VoucherLine } from '../../entities/voucher-line.entity';
import { CustodySettlementLine } from '../../entities/custody-settlement-line.entity';
import { CustodySettlement } from '../../entities/custody-settlement.entity';
import { AccountBalancesController } from './account-balances.controller';

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

import {
  BranchesController,
  CurrenciesController,
  BankAccountsController,
  EWalletsController,
  ExpenseCategoriesMainController,
  ExpenseCategoriesSubController,
  CostCentersController,
  EmployeesController,
  VehiclesController,
  VendorsController,
  CustomersController,
} from './master-data.controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Branch,
      Currency,
      BankAccount,
      EWallet,
      ExpenseCategoryMain,
      ExpenseCategorySub,
      CostCenter,
      Employee,
      Vehicle,
      Vendor,
      Customer,
      AccountBalance,
      VoucherLine,
      CustodySettlementLine,
      CustodySettlement,
    ]),
  ],
  controllers: [
    BranchesController,
    CurrenciesController,
    BankAccountsController,
    EWalletsController,
    ExpenseCategoriesMainController,
    ExpenseCategoriesSubController,
    CostCentersController,
    EmployeesController,
    VehiclesController,
    VendorsController,
    CustomersController,
    AccountBalancesController,
  ],
  providers: [
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
  ],
})
export class MasterDataModule {}
