import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';

export enum DueStatus {
  PENDING = 'pending', // لسه مستحق
  PAID = 'paid', // اتسدد من عندنا (يدوي، مش أوتوماتيك من الأذون)
}

@Entity('vendor_dues')
export class VendorDue {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

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

  // من أي ملف إكسيل جه السطر ده - يفيد لو حبينا نلغي/نراجع دفعة استيراد معينة
  @Column({ name: 'import_batch', length: 50, nullable: true })
  importBatch: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
