"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterDataModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const branch_entity_1 = require("../../entities/branch.entity");
const currency_entity_1 = require("../../entities/currency.entity");
const bank_account_entity_1 = require("../../entities/bank-account.entity");
const e_wallet_entity_1 = require("../../entities/e-wallet.entity");
const expense_category_main_entity_1 = require("../../entities/expense-category-main.entity");
const expense_category_sub_entity_1 = require("../../entities/expense-category-sub.entity");
const cost_center_entity_1 = require("../../entities/cost-center.entity");
const employee_entity_1 = require("../../entities/employee.entity");
const vehicle_entity_1 = require("../../entities/vehicle.entity");
const vendor_entity_1 = require("../../entities/vendor.entity");
const customer_entity_1 = require("../../entities/customer.entity");
const account_balance_entity_1 = require("../../entities/account-balance.entity");
const voucher_line_entity_1 = require("../../entities/voucher-line.entity");
const custody_settlement_line_entity_1 = require("../../entities/custody-settlement-line.entity");
const custody_settlement_entity_1 = require("../../entities/custody-settlement.entity");
const account_balances_controller_1 = require("./account-balances.controller");
const master_data_services_1 = require("./master-data.services");
const master_data_controllers_1 = require("./master-data.controllers");
let MasterDataModule = class MasterDataModule {
};
exports.MasterDataModule = MasterDataModule;
exports.MasterDataModule = MasterDataModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                branch_entity_1.Branch,
                currency_entity_1.Currency,
                bank_account_entity_1.BankAccount,
                e_wallet_entity_1.EWallet,
                expense_category_main_entity_1.ExpenseCategoryMain,
                expense_category_sub_entity_1.ExpenseCategorySub,
                cost_center_entity_1.CostCenter,
                employee_entity_1.Employee,
                vehicle_entity_1.Vehicle,
                vendor_entity_1.Vendor,
                customer_entity_1.Customer,
                account_balance_entity_1.AccountBalance,
                voucher_line_entity_1.VoucherLine,
                custody_settlement_line_entity_1.CustodySettlementLine,
                custody_settlement_entity_1.CustodySettlement,
            ]),
        ],
        controllers: [
            master_data_controllers_1.BranchesController,
            master_data_controllers_1.CurrenciesController,
            master_data_controllers_1.BankAccountsController,
            master_data_controllers_1.EWalletsController,
            master_data_controllers_1.ExpenseCategoriesMainController,
            master_data_controllers_1.ExpenseCategoriesSubController,
            master_data_controllers_1.CostCentersController,
            master_data_controllers_1.EmployeesController,
            master_data_controllers_1.VehiclesController,
            master_data_controllers_1.VendorsController,
            master_data_controllers_1.CustomersController,
            account_balances_controller_1.AccountBalancesController,
        ],
        providers: [
            master_data_services_1.BranchesService,
            master_data_services_1.CurrenciesService,
            master_data_services_1.BankAccountsService,
            master_data_services_1.EWalletsService,
            master_data_services_1.ExpenseCategoriesMainService,
            master_data_services_1.ExpenseCategoriesSubService,
            master_data_services_1.CostCentersService,
            master_data_services_1.EmployeesService,
            master_data_services_1.VehiclesService,
            master_data_services_1.VendorsService,
            master_data_services_1.CustomersService,
        ],
    })
], MasterDataModule);
//# sourceMappingURL=master-data.module.js.map