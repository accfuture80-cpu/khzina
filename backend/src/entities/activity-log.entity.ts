import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ActivityAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  DUPLICATE = 'duplicate',
  VIEW = 'view',
  APPROVE = 'approve',
  REJECT = 'reject',
  DISBURSE = 'disburse',
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ActivityAction })
  action: ActivityAction;

  // 'voucher' | 'settlement' | 'transfer' ...
  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id' })
  entityId: number;

  // بيانات إضافية (القيم قبل/بعد التعديل مثلاً)
  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
