import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  code: string;

  @Column({ name: 'plate_number', length: 30, nullable: true })
  plateNumber: string;

  @Column({ length: 100, nullable: true })
  model: string;

  // السائق المرتبط بالسيارة (علاقة دائرية مع Employee - طبيعي في TypeORM باستخدام lazy reference)
  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'driver_employee_id' })
  driver: Employee;
}
