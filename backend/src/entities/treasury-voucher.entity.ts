import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Currency } from './currency.entity';
import { Branch } from './branch.entity';
import { BankAccount } from './bank-account.entity';
import { EWallet } from './e-wallet.entity';
import { User } from './user.entity';
import { VoucherLine } from './voucher-line.entity';

export enum VoucherType {
  EXPENSE = 'expense',
  REVENUE = 'revenue',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK = 'bank',
  WALLET = 'wallet',
}

export enum ApprovalPath {
  ADMIN_MANAGER = 'admin_manager',
  PRODUCTION_MANAGER = 'production_manager',
}

// حالات الإذن عبر دورة حياته الكاملة
export enum VoucherStatus {
  DRAFT = 'draft',
  PENDING_FIRST_APPROVAL = 'pending_first_approval',
  PENDING_FINANCIAL_REVIEW = 'pending_financial_review',
  PENDING_GM_APPROVAL = 'pending_gm_approval',
  APPROVED_FINAL = 'approved_final',
  DISBURSED = 'disbursed',
  REJECTED = 'rejected',
}

@Entity('treasury_vouchers')
export class TreasuryVoucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'voucher_type', type: 'enum', enum: VoucherType })
  voucherType: VoucherType;

  @Column({ name: 'serial_number', unique: true, length: 30 })
  serialNumber: string;

  @Column({ name: 'voucher_date', type: 'date' })
  voucherDate: string;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => BankAccount, { nullable: true })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @ManyToOne(() => EWallet, { nullable: true })
  @JoinColumn({ name: 'wallet_id' })
  wallet: EWallet;

  @Column({
    name: 'approval_path',
    type: 'enum',
    enum: ApprovalPath,
    nullable: true,
  })
  approvalPath: ApprovalPath;

  @Column({
    type: 'enum',
    enum: VoucherStatus,
    default: VoucherStatus.DRAFT,
  })
  status: VoucherStatus;

  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 18,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @ManyToOne(() => TreasuryVoucher, { nullable: true })
  @JoinColumn({ name: 'duplicated_from_id' })
  duplicatedFrom: TreasuryVoucher;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'disbursed_by' })
  disbursedBy: User;

  @Column({ name: 'disbursed_at', type: 'timestamp', nullable: true })
  disbursedAt: Date;

  @OneToMany(() => VoucherLine, (line) => line.voucher, { cascade: true })
  lines: VoucherLine[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
