import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AttachableType {
  VOUCHER = 'voucher',
  SETTLEMENT = 'settlement',
  TRANSFER = 'transfer',
}

// نوع المرفق - عشان يبقى واضح وقت العرض للاعتماد إيه ده (شيك؟ فاتورة؟)
export enum AttachmentCategory {
  CHEQUE = 'cheque',
  INVOICE = 'invoice',
  OTHER = 'other',
}

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'attachable_type', type: 'enum', enum: AttachableType })
  attachableType: AttachableType;

  @Column({ name: 'attachable_id' })
  attachableId: number;

  @Column({
    type: 'enum',
    enum: AttachmentCategory,
    default: AttachmentCategory.OTHER,
  })
  category: AttachmentCategory;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'original_name', length: 255, nullable: true })
  originalName: string;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
