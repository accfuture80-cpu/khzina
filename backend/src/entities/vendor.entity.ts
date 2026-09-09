import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  code: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
