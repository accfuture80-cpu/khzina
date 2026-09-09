import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { TreasuryVoucher } from './treasury-voucher.entity';
import { ExpenseCategoryMain } from './expense-category-main.entity';
import { ExpenseCategorySub } from './expense-category-sub.entity';
import { CostCenter } from './cost-center.entity';
import { Employee } from './employee.entity';
import { Vehicle } from './vehicle.entity';
import { Vendor } from './vendor.entity';
import { Customer } from './customer.entity';

export enum VoucherLineType {
  EXPENSE = 'expense', // مصروف عادي
  CUSTODY_ADVANCE = 'custody_advance', // عهدة / سلفة
  VENDOR_PAYMENT = 'vendor_payment', // سداد مورد
  OTHER_REVENUE = 'other_revenue', // إيراد آخر
  CUSTOMER_COLLECTION = 'customer_collection', // تحصيل من عميل
  CUSTODY_REPAYMENT = 'custody_repayment', // رد عهدة/سلفة
  BANK_COMMISSION = 'bank_commission', // عمولة / مصاريف بنكية
  TRANSFER = 'transfer', // تحويل من/إلى الخزينة
  TREASURY_FUNDING = 'treasury_funding', // تمويل الخزينة (ضخ رأس مال/تمويل من الإدارة)
}

@Entity('voucher_lines')
export class VoucherLine {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TreasuryVoucher, (voucher) => voucher.lines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'voucher_id' })
  voucher: TreasuryVoucher;

  @Column({ name: 'line_type', type: 'enum', enum: VoucherLineType })
  lineType: VoucherLineType;

  @ManyToOne(() => ExpenseCategoryMain, { nullable: true })
  @JoinColumn({ name: 'main_category_id' })
  mainCategory: ExpenseCategoryMain;

  @ManyToOne(() => ExpenseCategorySub, { nullable: true })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: ExpenseCategorySub;

  @ManyToOne(() => CostCenter, { nullable: true })
  @JoinColumn({ name: 'cost_center_id' })
  costCenter: CostCenter;

  // للعهد والسلف
  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // لو صرف على سيارة
  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  amount: number;

  @Column({ length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
