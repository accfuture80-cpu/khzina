import { Repository } from 'typeorm';
import { BaseCrudService } from './base-crud.service';
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
import { VoucherLine } from '../../entities/voucher-line.entity';
import { CustodySettlementLine } from '../../entities/custody-settlement-line.entity';
import { CustodySettlement } from '../../entities/custody-settlement.entity';
export declare class BranchesService extends BaseCrudService<Branch> {
    constructor(repo: Repository<Branch>);
}
export declare class CurrenciesService extends BaseCrudService<Currency> {
    constructor(repo: Repository<Currency>);
}
export declare class BankAccountsService extends BaseCrudService<BankAccount> {
    constructor(repo: Repository<BankAccount>);
}
export declare class EWalletsService extends BaseCrudService<EWallet> {
    constructor(repo: Repository<EWallet>);
}
export declare class ExpenseCategoriesMainService extends BaseCrudService<ExpenseCategoryMain> {
    private readonly voucherLineRepo;
    private readonly settlementLineRepo;
    constructor(repo: Repository<ExpenseCategoryMain>, voucherLineRepo: Repository<VoucherLine>, settlementLineRepo: Repository<CustodySettlementLine>);
    protected assertRemovable(entity: ExpenseCategoryMain): Promise<void>;
}
export declare class ExpenseCategoriesSubService extends BaseCrudService<ExpenseCategorySub> {
    private readonly voucherLineRepo;
    private readonly settlementLineRepo;
    constructor(repo: Repository<ExpenseCategorySub>, voucherLineRepo: Repository<VoucherLine>, settlementLineRepo: Repository<CustodySettlementLine>);
    findByMainCategory(mainCategoryId: number): Promise<ExpenseCategorySub[]>;
    protected assertRemovable(entity: ExpenseCategorySub): Promise<void>;
}
export declare class CostCentersService extends BaseCrudService<CostCenter> {
    private readonly voucherLineRepo;
    private readonly settlementLineRepo;
    constructor(repo: Repository<CostCenter>, voucherLineRepo: Repository<VoucherLine>, settlementLineRepo: Repository<CustodySettlementLine>);
    protected assertRemovable(entity: CostCenter): Promise<void>;
}
export declare class EmployeesService extends BaseCrudService<Employee> {
    private readonly voucherLineRepo;
    private readonly settlementRepo;
    private readonly vehicleRepo;
    constructor(repo: Repository<Employee>, voucherLineRepo: Repository<VoucherLine>, settlementRepo: Repository<CustodySettlement>, vehicleRepo: Repository<Vehicle>);
    protected assertRemovable(entity: Employee): Promise<void>;
}
export declare class VehiclesService extends BaseCrudService<Vehicle> {
    private readonly voucherLineRepo;
    private readonly employeeRepo;
    constructor(repo: Repository<Vehicle>, voucherLineRepo: Repository<VoucherLine>, employeeRepo: Repository<Employee>);
    protected assertRemovable(entity: Vehicle): Promise<void>;
}
export declare class VendorsService extends BaseCrudService<Vendor> {
    private readonly voucherLineRepo;
    constructor(repo: Repository<Vendor>, voucherLineRepo: Repository<VoucherLine>);
    protected assertRemovable(entity: Vendor): Promise<void>;
}
export declare class CustomersService extends BaseCrudService<Customer> {
    private readonly voucherLineRepo;
    constructor(repo: Repository<Customer>, voucherLineRepo: Repository<VoucherLine>);
    protected assertRemovable(entity: Customer): Promise<void>;
}
