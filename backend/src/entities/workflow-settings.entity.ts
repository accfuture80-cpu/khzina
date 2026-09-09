import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

// إعدادات دورة اعتماد الأذون - تتحكم في تخطي أي خطوة من الخطوات
// كل الأذون بتمر على الاعتماد الأول (مدير إداري/إنتاجي) إجباري مينفعش يتخطى
// لكن المراجعة المالية واعتماد المدير العام ممكن الأدمن يقفلهم لو مش محتاجهم
@Entity('workflow_settings')
export class WorkflowSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'require_financial_review', default: true })
  requireFinancialReview: boolean;

  @Column({ name: 'require_gm_approval', default: true })
  requireGmApproval: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
