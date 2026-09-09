import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cost_centers')
export class CostCenter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  code: string;

  @Column({ length: 150 })
  name: string;
}
