import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CustodySettlement } from './custody-settlement.entity';
import { ExpenseCategoryMain } from './expense-category-main.entity';
import { ExpenseCategorySub } from './expense-category-sub.entity';
import { CostCenter } from './cost-center.entity';

@Entity('custody_settlement_lines')
export class CustodySettlementLine {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CustodySettlement, (settlement) => settlement.lines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'settlement_id' })
  settlement: CustodySettlement;

  @ManyToOne(() => ExpenseCategoryMain, { nullable: true })
  @JoinColumn({ name: 'main_category_id' })
  mainCategory: ExpenseCategoryMain;

  @ManyToOne(() => ExpenseCategorySub, { nullable: true })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: ExpenseCategorySub;

  @ManyToOne(() => CostCenter, { nullable: true })
  @JoinColumn({ name: 'cost_center_id' })
  costCenter: CostCenter;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  amount: number;

  @Column({ length: 255, nullable: true })
  description: string;
}
