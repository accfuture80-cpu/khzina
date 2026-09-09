import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { TreasuryVoucher } from './treasury-voucher.entity';
import { User } from './user.entity';

// خطوات الاعتماد الأربعة في مسار الإذن
export enum ApprovalStep {
  FIRST_APPROVAL = 'first_approval', // مدير إداري / إنتاج
  FINANCIAL_REVIEW = 'financial_review', // المدير المالي (مراجعة + اعتماد)
  GM_APPROVAL = 'gm_approval', // المدير العام
  DISBURSEMENT = 'disbursement', // محاسب الخزينة
}

export enum ApprovalDecision {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('voucher_approvals')
export class VoucherApproval {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TreasuryVoucher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voucher_id' })
  voucher: TreasuryVoucher;

  @Column({ type: 'enum', enum: ApprovalStep })
  step: ApprovalStep;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approver_user_id' })
  approver: User;

  @Column({ type: 'enum', enum: ApprovalDecision })
  decision: ApprovalDecision;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ name: 'decided_at' })
  decidedAt: Date;
}
