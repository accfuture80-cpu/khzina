import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { Customer } from './customer.entity';
import { BankAccount } from './bank-account.entity';

export enum CheckDirection {
  RECEIVABLE = 'receivable', // شيك وارد هيتحصل من عميل
  PAYABLE = 'payable', // شيك صادر هيتصرف لمورد
}

export enum CheckStatus {
  PENDING = 'pending', // لسه تحت التحصيل/الصرف
  COLLECTED = 'collected', // اتحصّل/اتصرف فعلاً
  BOUNCED = 'bounced', // ارتد (شيك بدون رصيد)
}

@Entity('checks')
export class Check {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'check_number', length: 50 })
  checkNumber: string;

  @Column({ type: 'enum', enum: CheckDirection })
  direction: CheckDirection;

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // البنك اللي الشيك مسحوب عليه/هيتحصل فيه - يفيد في الربط بشاشة كشف حساب البنك
  @ManyToOne(() => BankAccount, { nullable: true })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @Column({ name: 'bank_name', length: 150, nullable: true })
  bankName: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: CheckStatus, default: CheckStatus.PENDING })
  status: CheckStatus;

  @Column({ length: 255, nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
