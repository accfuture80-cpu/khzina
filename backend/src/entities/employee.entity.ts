import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  code: string;

  @Column({ length: 150 })
  name: string;

  @Column({ name: 'job_title', length: 100, nullable: true })
  jobTitle: string;

  // admin / production / other - يفيد في تحديد مسار الاعتماد
  @Column({ length: 50, nullable: true })
  department: string;

  // الموظف اللي مربوط على سيارة (لو سائق)
  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'linked_vehicle_id' })
  linkedVehicle: Vehicle;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
