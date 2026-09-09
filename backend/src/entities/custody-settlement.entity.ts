import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { VoucherLine } from './voucher-line.entity';
import { Employee } from './employee.entity';
import { User } from './user.entity';
import { CustodySettlementLine } from './custody-settlement-line.entity';

export enum SettlementStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
}

@Entity('custody_settlements')
export class CustodySettlement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'serial_number', unique: true, length: 30 })
  serialNumber: string;

  // العهدة الأصلية (بند الإذن) اللي بتتسوى
  @ManyToOne(() => VoucherLine)
  @JoinColumn({ name: 'custody_voucher_line_id' })
  custodyVoucherLine: VoucherLine;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'settlement_date', type: 'date' })
  settlementDate: string;

  @Column({ type: 'enum', enum: SettlementStatus, default: SettlementStatus.DRAFT })
  status: SettlementStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => CustodySettlementLine, (line) => line.settlement, {
    cascade: true,
  })
  lines: CustodySettlementLine[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
