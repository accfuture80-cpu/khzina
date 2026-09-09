import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Currency } from './currency.entity';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  code: string;

  @Column({ name: 'bank_name', length: 150 })
  bankName: string;

  @Column({ name: 'branch_name', length: 150, nullable: true })
  branchName: string;

  @Column({ name: 'account_number', length: 100 })
  accountNumber: string;

  @Column({ name: 'responsible_person', length: 150, nullable: true })
  responsiblePerson: string;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({
    name: 'opening_balance',
    type: 'numeric',
    precision: 18,
    scale: 2,
    default: 0,
  })
  openingBalance: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
