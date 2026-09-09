import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('expense_categories_main')
export class ExpenseCategoryMain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  code: string;

  @Column({ length: 150 })
  name: string;
}
