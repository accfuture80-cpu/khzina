import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from './base-crud.service';
import { assertNotReferenced } from './assert-not-referenced';
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

@Injectable()
export class BranchesService extends BaseCrudService<Branch> {
  constructor(@InjectRepository(Branch) repo: Repository<Branch>) {
    super(repo);
  }
}

@Injectable()
export class CurrenciesService extends BaseCrudService<Currency> {
  constructor(@InjectRepository(Currency) repo: Repository<Currency>) {
    super(repo);
  }
}

@Injectable()
export class BankAccountsService extends BaseCrudService<BankAccount> {
  constructor(@InjectRepository(BankAccount) repo: Repository<BankAccount>) {
    super(repo, ['currency']);
  }
}

@Injectable()
export class EWalletsService extends BaseCrudService<EWallet> {
  constructor(@InjectRepository(EWallet) repo: Repository<EWallet>) {
    super(repo);
  }
}

@Injectable()
export class ExpenseCategoriesMainService extends BaseCrudService<ExpenseCategoryMain> {
  constructor(
    @InjectRepository(ExpenseCategoryMain) repo: Repository<ExpenseCategoryMain>,
    @InjectRepository(VoucherLine) private readonly voucherLineRepo: Repository<VoucherLine>,
    @InjectRepository(CustodySettlementLine)
    private readonly settlementLineRepo: Repository<CustodySettlementLine>,
  ) {
    super(repo);
  }

  protected async assertRemovable(entity: ExpenseCategoryMain): Promise<void> {
    await assertNotReferenced('بند المصروف الرئيسي', [
      {
        where: 'أذون الصرف/الإيراد',
        count: () => this.voucherLineRepo.count({ where: { mainCategory: { id: entity.id } } }),
      },
      {
        where: 'تسويات العهد',
        count: () =>
          this.settlementLineRepo.count({ where: { mainCategory: { id: entity.id } } }),
      },
    ]);
  }
}

@Injectable()
export class ExpenseCategoriesSubService extends BaseCrudService<ExpenseCategorySub> {
  constructor(
    @InjectRepository(ExpenseCategorySub) repo: Repository<ExpenseCategorySub>,
    @InjectRepository(VoucherLine) private readonly voucherLineRepo: Repository<VoucherLine>,
    @InjectRepository(CustodySettlementLine)
    private readonly settlementLineRepo: Repository<CustodySettlementLine>,
  ) {
    super(repo, ['mainCategory']);
  }

  // خاصية إضافية: هات كل الفرعي المرتبط برئيسي معين بس (للـ Dropdown المتسلسل في الفرونت)
  findByMainCategory(mainCategoryId: number) {
    return this.repository.find({
      where: { mainCategory: { id: mainCategoryId } },
      order: { id: 'ASC' },
      relations: ['mainCategory'],
    });
  }

  protected async assertRemovable(entity: ExpenseCategorySub): Promise<void> {
    await assertNotReferenced('بند المصروف الفرعي', [
      {
        where: 'أذون الصرف/الإيراد',
        count: () => this.voucherLineRepo.count({ where: { subCategory: { id: entity.id } } }),
      },
      {
        where: 'تسويات العهد',
        count: () =>
          this.settlementLineRepo.count({ where: { subCategory: { id: entity.id } } }),
      },
    ]);
  }
}

@Injectable()
export class CostCentersService extends BaseCrudService<CostCenter> {
  constructor(
    @InjectRepository(CostCenter) repo: Repository<CostCenter>,
    @InjectRepository(VoucherLine) private readonly voucherLineRepo: Repository<VoucherLine>,
    @InjectRepository(CustodySettlementLine)
    private readonly settlementLineRepo: Repository<CustodySettlementLine>,
  ) {
    super(repo);
  }

  protected async assertRemovable(entity: CostCenter): Promise<void> {
    await assertNotReferenced('مركز التكلفة', [
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
}

@Injectable()
export class EmployeesService extends BaseCrudService<Employee> {
  constructor(
    @InjectRepository(Employee) repo: Repository<Employee>,
    @InjectRepository(VoucherLine) private readonly voucherLineRepo: Repository<VoucherLine>,
    @InjectRepository(CustodySettlement)
    private readonly settlementRepo: Repository<CustodySettlement>,
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
  ) {
    super(repo, ['linkedVehicle']);
  }

  protected async assertRemovable(entity: Employee): Promise<void> {
    await assertNotReferenced(
      'الموظف',
      [
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
      ],
      true,
    );
  }
}

@Injectable()
export class VehiclesService extends BaseCrudService<Vehicle> {
  constructor(
    @InjectRepository(Vehicle) repo: Repository<Vehicle>,
    @InjectRepository(VoucherLine) private readonly voucherLineRepo: Repository<VoucherLine>,
    @InjectRepository(Employee) private readonly employeeRepo: Repository<Employee>,
  ) {
    super(repo, ['driver']);
  }

  protected async assertRemovable(entity: Vehicle): Promise<void> {
    await assertNotReferenced('السيارة', [
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
}

@Injectable()
export class VendorsService extends BaseCrudService<Vendor> {
  constructor(
    @InjectRepository(Vendor) repo: Repository<Vendor>,
    @InjectRepository(VoucherLine) private readonly voucherLineRepo: Repository<VoucherLine>,
  ) {
    super(repo);
  }

  protected async assertRemovable(entity: Vendor): Promise<void> {
    await assertNotReferenced(
      'المورد',
      [
        {
          where: 'أذون سداد الموردين',
          count: () => this.voucherLineRepo.count({ where: { vendor: { id: entity.id } } }),
        },
      ],
      true,
    );
  }
}

@Injectable()
export class CustomersService extends BaseCrudService<Customer> {
  constructor(
    @InjectRepository(Customer) repo: Repository<Customer>,
    @InjectRepository(VoucherLine) private readonly voucherLineRepo: Repository<VoucherLine>,
  ) {
    super(repo);
  }

  protected async assertRemovable(entity: Customer): Promise<void> {
    await assertNotReferenced(
      'العميل',
      [
        {
          where: 'أذون تحصيل العملاء',
          count: () => this.voucherLineRepo.count({ where: { customer: { id: entity.id } } }),
        },
      ],
      true,
    );
  }
}
