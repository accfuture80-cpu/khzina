import { BranchesService, CurrenciesService, BankAccountsService, EWalletsService, ExpenseCategoriesMainService, ExpenseCategoriesSubService, CostCentersService, EmployeesService, VehiclesService, VendorsService, CustomersService } from './master-data.services';
export declare class BranchesController {
    private readonly service;
    constructor(service: BranchesService);
    findAll(): Promise<import("../../entities/branch.entity").Branch[]>;
    findOne(id: number): Promise<import("../../entities/branch.entity").Branch>;
    create(dto: any): Promise<import("../../entities/branch.entity").Branch>;
    update(id: number, dto: any): Promise<import("../../entities/branch.entity").Branch>;
    remove(id: number): Promise<void>;
}
export declare class CurrenciesController {
    private readonly service;
    constructor(service: CurrenciesService);
    findAll(): Promise<import("../../entities/currency.entity").Currency[]>;
    findOne(id: number): Promise<import("../../entities/currency.entity").Currency>;
    create(dto: any): Promise<import("../../entities/currency.entity").Currency>;
    update(id: number, dto: any): Promise<import("../../entities/currency.entity").Currency>;
    remove(id: number): Promise<void>;
}
export declare class BankAccountsController {
    private readonly service;
    constructor(service: BankAccountsService);
    findAll(): Promise<import("../../entities/bank-account.entity").BankAccount[]>;
    findOne(id: number): Promise<import("../../entities/bank-account.entity").BankAccount>;
    create(dto: any): Promise<import("../../entities/bank-account.entity").BankAccount>;
    update(id: number, dto: any): Promise<import("../../entities/bank-account.entity").BankAccount>;
    remove(id: number): Promise<void>;
}
export declare class EWalletsController {
    private readonly service;
    constructor(service: EWalletsService);
    findAll(): Promise<import("../../entities/e-wallet.entity").EWallet[]>;
    findOne(id: number): Promise<import("../../entities/e-wallet.entity").EWallet>;
    create(dto: any): Promise<import("../../entities/e-wallet.entity").EWallet>;
    update(id: number, dto: any): Promise<import("../../entities/e-wallet.entity").EWallet>;
    remove(id: number): Promise<void>;
}
export declare class ExpenseCategoriesMainController {
    private readonly service;
    constructor(service: ExpenseCategoriesMainService);
    findAll(): Promise<import("../../entities/expense-category-main.entity").ExpenseCategoryMain[]>;
    findOne(id: number): Promise<import("../../entities/expense-category-main.entity").ExpenseCategoryMain>;
    create(dto: any): Promise<import("../../entities/expense-category-main.entity").ExpenseCategoryMain>;
    update(id: number, dto: any): Promise<import("../../entities/expense-category-main.entity").ExpenseCategoryMain>;
    remove(id: number): Promise<void>;
}
export declare class ExpenseCategoriesSubController {
    private readonly service;
    constructor(service: ExpenseCategoriesSubService);
    findAll(mainCategoryId?: string): Promise<import("../../entities/expense-category-sub.entity").ExpenseCategorySub[]>;
    findOne(id: number): Promise<import("../../entities/expense-category-sub.entity").ExpenseCategorySub>;
    create(dto: any): Promise<import("../../entities/expense-category-sub.entity").ExpenseCategorySub>;
    update(id: number, dto: any): Promise<import("../../entities/expense-category-sub.entity").ExpenseCategorySub>;
    remove(id: number): Promise<void>;
}
export declare class CostCentersController {
    private readonly service;
    constructor(service: CostCentersService);
    findAll(): Promise<import("../../entities/cost-center.entity").CostCenter[]>;
    findOne(id: number): Promise<import("../../entities/cost-center.entity").CostCenter>;
    create(dto: any): Promise<import("../../entities/cost-center.entity").CostCenter>;
    update(id: number, dto: any): Promise<import("../../entities/cost-center.entity").CostCenter>;
    remove(id: number): Promise<void>;
}
export declare class EmployeesController {
    private readonly service;
    constructor(service: EmployeesService);
    findAll(): Promise<import("../../entities/employee.entity").Employee[]>;
    findOne(id: number): Promise<import("../../entities/employee.entity").Employee>;
    create(dto: any): Promise<import("../../entities/employee.entity").Employee>;
    update(id: number, dto: any): Promise<import("../../entities/employee.entity").Employee>;
    remove(id: number): Promise<void>;
}
export declare class VehiclesController {
    private readonly service;
    constructor(service: VehiclesService);
    findAll(): Promise<import("../../entities/vehicle.entity").Vehicle[]>;
    findOne(id: number): Promise<import("../../entities/vehicle.entity").Vehicle>;
    create(dto: any): Promise<import("../../entities/vehicle.entity").Vehicle>;
    update(id: number, dto: any): Promise<import("../../entities/vehicle.entity").Vehicle>;
    remove(id: number): Promise<void>;
}
export declare class VendorsController {
    private readonly service;
    constructor(service: VendorsService);
    findAll(): Promise<import("../../entities/vendor.entity").Vendor[]>;
    findOne(id: number): Promise<import("../../entities/vendor.entity").Vendor>;
    create(dto: any): Promise<import("../../entities/vendor.entity").Vendor>;
    update(id: number, dto: any): Promise<import("../../entities/vendor.entity").Vendor>;
    remove(id: number): Promise<void>;
}
export declare class CustomersController {
    private readonly service;
    constructor(service: CustomersService);
    findAll(): Promise<import("../../entities/customer.entity").Customer[]>;
    findOne(id: number): Promise<import("../../entities/customer.entity").Customer>;
    create(dto: any): Promise<import("../../entities/customer.entity").Customer>;
    update(id: number, dto: any): Promise<import("../../entities/customer.entity").Customer>;
    remove(id: number): Promise<void>;
}
