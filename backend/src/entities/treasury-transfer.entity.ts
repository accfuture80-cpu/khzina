import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AccountKind {
  MAIN_TREASURY = 'main_treasury',
  BRANCH = 'branch',
  BANK = 'bank',
  WALLET = 'wallet',
}

export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  EXECUTED = 'executed',
}

@Entity('treasury_transfers')
export class TreasuryTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'serial_number', unique: true, length: 30 })
  serialNumber: string;

  @Column({ name: 'transfer_date', type: 'date' })
  transferDate: string;

  @Column({ name: 'from_type', type: 'enum', enum: AccountKind })
  fromType: AccountKind;

  @Column({ name: 'from_id' })
  fromId: number;

  @Column({ name: 'to_type', type: 'enum', enum: AccountKind })
  toType: AccountKind;

  @Column({ name: 'to_id' })
  toId: number;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  amount: number;

  @Column({
    name: 'commission_amount',
    type: 'numeric',
    precision: 18,
    scale: 2,
    default: 0,
  })
  commissionAmount: number;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
