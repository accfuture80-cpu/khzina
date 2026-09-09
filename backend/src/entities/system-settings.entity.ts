import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('system_settings')
export class SystemSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_name', length: 150, default: 'اسم الشركة' })
  companyName: string;

  @Column({ name: 'company_address', length: 255, nullable: true })
  companyAddress: string;

  @Column({ name: 'company_phone', length: 30, nullable: true })
  companyPhone: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
