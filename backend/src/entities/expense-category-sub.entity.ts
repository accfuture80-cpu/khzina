import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExpenseCategoryMain } from './expense-category-main.entity';

@Entity('expense_categories_sub')
export class ExpenseCategorySub {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  code: string;

  @Column({ length: 150 })
  name: string;

  // العلاقة اللي بتخلي الفرعي يظهر بس لما تختار الرئيسي بتاعه
  @ManyToOne(() => ExpenseCategoryMain)
  @JoinColumn({ name: 'main_category_id' })
  mainCategory: ExpenseCategoryMain;
}
