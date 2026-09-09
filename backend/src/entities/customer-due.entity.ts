import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { DueStatus } from './vendor-due.entity';

@Entity('customer_dues')
export class CustomerDue {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'invoice_number', length: 50, nullable: true })
  invoiceNumber: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: string;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  amount: number;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'enum', enum: DueStatus, default: DueStatus.PENDING })
  status: DueStatus;

  @Column({ name: 'import_batch', length: 50, nullable: true })
  importBatch: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
