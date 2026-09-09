"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = exports.VendorsService = exports.VehiclesService = exports.EmployeesService = exports.CostCentersService = exports.ExpenseCategoriesSubService = exports.ExpenseCategoriesMainService = exports.EWalletsService = exports.BankAccountsService = exports.CurrenciesService = exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_crud_service_1 = require("./base-crud.service");
const assert_not_referenced_1 = require("./assert-not-referenced");
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
const voucher_line_entity_1 = require("../../entities/voucher-line.entity");
const custody_settlement_line_entity_1 = require("../../entities/custody-settlement-line.entity");
const custody_settlement_entity_1 = require("../../entities/custody-settlement.entity");
let BranchesService = class BranchesService extends base_crud_service_1.BaseCrudService {
    constructor(repo) {
        super(repo);
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BranchesService);
let CurrenciesService = class CurrenciesService extends base_crud_service_1.BaseCrudService {
    constructor(repo) {
        super(repo);
    }
};
exports.CurrenciesService = CurrenciesService;
exports.CurrenciesService = CurrenciesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(currency_entity_1.Currency)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CurrenciesService);
let BankAccountsService = class BankAccountsService extends base_crud_service_1.BaseCrudService {
    constructor(repo) {
        super(repo, ['currency']);
    }
};
exports.BankAccountsService = BankAccountsService;
exports.BankAccountsService = BankAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BankAccountsService);
let EWalletsService = class EWalletsService extends base_crud_service_1.BaseCrudService {
    constructor(repo) {
        super(repo);
    }
};
exports.EWalletsService = EWalletsService;
exports.EWalletsService = EWalletsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(e_wallet_entity_1.EWallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EWalletsService);
let ExpenseCategoriesMainService = class ExpenseCategoriesMainService extends base_crud_service_1.BaseCrudService {
    constructor(repo, voucherLineRepo, settlementLineRepo) {
        super(repo);
        this.voucherLineRepo = voucherLineRepo;
        this.settlementLineRepo = settlementLineRepo;
    }
    async assertRemovable(entity) {
        await (0, assert_not_referenced_1.assertNotReferenced)('بند المصروف الرئيسي', [
            {
                where: 'أذون الصرف/الإيراد',
                count: () => this.voucherLineRepo.count({ where: { mainCategory: { id: entity.id } } }),
            },
            {
                where: 'تسويات العهد',
                count: () => this.settlementLineRepo.count({ where: { mainCategory: { id: entity.id } } }),
            },
        ]);
    }
};
exports.ExpenseCategoriesMainService = ExpenseCategoriesMainService;
exports.ExpenseCategoriesMainService = ExpenseCategoriesMainService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(expense_category_main_entity_1.ExpenseCategoryMain)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_line_entity_1.VoucherLine)),
    __param(2, (0, typeorm_1.InjectRepository)(custody_settlement_line_entity_1.CustodySettlementLine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ExpenseCategoriesMainService);
let ExpenseCategoriesSubService = class ExpenseCategoriesSubService extends base_crud_service_1.BaseCrudService {
    constructor(repo, voucherLineRepo, settlementLineRepo) {
        super(repo, ['mainCategory']);
        this.voucherLineRepo = voucherLineRepo;
        this.settlementLineRepo = settlementLineRepo;
    }
    findByMainCategory(mainCategoryId) {
        return this.repository.find({
            where: { mainCategory: { id: mainCategoryId } },
            order: { id: 'ASC' },
            relations: ['mainCategory'],
        });
    }
    async assertRemovable(entity) {
        await (0, assert_not_referenced_1.assertNotReferenced)('بند المصروف الفرعي', [
            {
                where: 'أذون الصرف/الإيراد',
                count: () => this.voucherLineRepo.count({ where: { subCategory: { id: entity.id } } }),
            },
            {
                where: 'تسويات العهد',
                count: () => this.settlementLineRepo.count({ where: { subCategory: { id: entity.id } } }),
            },
        ]);
    }
};
exports.ExpenseCategoriesSubService = ExpenseCategoriesSubService;
exports.ExpenseCategoriesSubService = ExpenseCategoriesSubService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(expense_category_sub_entity_1.ExpenseCategorySub)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_line_entity_1.VoucherLine)),
    __param(2, (0, typeorm_1.InjectRepository)(custody_settlement_line_entity_1.CustodySettlementLine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ExpenseCategoriesSubService);
let CostCentersService = class CostCentersService extends base_crud_service_1.BaseCrudService {
    constructor(repo, voucherLineRepo, settlementLineRepo) {
        super(repo);
        this.voucherLineRepo = voucherLineRepo;
        this.settlementLineRepo = settlementLineRepo;
    }
    async assertRemovable(entity) {
        await (0, assert_not_referenced_1.assertNotReferenced)('مركز التكلفة', [
            {
                where: 'أذون الصرف/الإيراد',
                count: () => this.voucherLineRepo.count({ where: { costCenter: { id: entity.id } } }),
            },
            {
                where: 'تسويات العهد',
                count: () => this.settlementLineRepo.count({ where: { costCenter: { id: entity.id } } }),
            },
        ]);
    }
};
exports.CostCentersService = CostCentersService;
exports.CostCentersService = CostCentersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cost_center_entity_1.CostCenter)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_line_entity_1.VoucherLine)),
    __param(2, (0, typeorm_1.InjectRepository)(custody_settlement_line_entity_1.CustodySettlementLine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CostCentersService);
let EmployeesService = class EmployeesService extends base_crud_service_1.BaseCrudService {
    constructor(repo, voucherLineRepo, settlementRepo, vehicleRepo) {
        super(repo, ['linkedVehicle']);
        this.voucherLineRepo = voucherLineRepo;
        this.settlementRepo = settlementRepo;
        this.vehicleRepo = vehicleRepo;
    }
    async assertRemovable(entity) {
        await (0, assert_not_referenced_1.assertNotReferenced)('الموظف', [
            {
                where: 'أذون العهد/السلف',
                count: () => this.voucherLineRepo.count({ where: { employee: { id: entity.id } } }),
            },
            {
                where: 'تسويات العهد',
                count: () => this.settlementRepo.count({ where: { employee: { id: entity.id } } }),
            },
            {
                where: 'سيارات مرتبطة به كسائق',
                count: () => this.vehicleRepo.count({ where: { driver: { id: entity.id } } }),
            },
        ], true);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_line_entity_1.VoucherLine)),
    __param(2, (0, typeorm_1.InjectRepository)(custody_settlement_entity_1.CustodySettlement)),
    __param(3, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EmployeesService);
let VehiclesService = class VehiclesService extends base_crud_service_1.BaseCrudService {
    constructor(repo, voucherLineRepo, employeeRepo) {
        super(repo, ['driver']);
        this.voucherLineRepo = voucherLineRepo;
        this.employeeRepo = employeeRepo;
    }
    async assertRemovable(entity) {
        await (0, assert_not_referenced_1.assertNotReferenced)('السيارة', [
            {
                where: 'أذون الصرف',
                count: () => this.voucherLineRepo.count({ where: { vehicle: { id: entity.id } } }),
            },
            {
                where: 'بيانات موظف مرتبط بيها',
                count: () => this.employeeRepo.count({ where: { linkedVehicle: { id: entity.id } } }),
            },
        ]);
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_line_entity_1.VoucherLine)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], VehiclesService);
let VendorsService = class VendorsService extends base_crud_service_1.BaseCrudService {
    constructor(repo, voucherLineRepo) {
        super(repo);
        this.voucherLineRepo = voucherLineRepo;
    }
    async assertRemovable(entity) {
        await (0, assert_not_referenced_1.assertNotReferenced)('المورد', [
            {
                where: 'أذون سداد الموردين',
                count: () => this.voucherLineRepo.count({ where: { vendor: { id: entity.id } } }),
            },
        ], true);
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_line_entity_1.VoucherLine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], VendorsService);
let CustomersService = class CustomersService extends base_crud_service_1.BaseCrudService {
    constructor(repo, voucherLineRepo) {
        super(repo);
        this.voucherLineRepo = voucherLineRepo;
    }
    async assertRemovable(entity) {
        await (0, assert_not_referenced_1.assertNotReferenced)('العميل', [
            {
                where: 'أذون تحصيل العملاء',
                count: () => this.voucherLineRepo.count({ where: { customer: { id: entity.id } } }),
            },
        ], true);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_line_entity_1.VoucherLine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=master-data.services.js.map