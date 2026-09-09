import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { AccountKind } from './treasury-transfer.entity';

// جدول رصيد لحظي محدث لكل حساب - عشان تسريع شاشة الأرصدة
// بيتحدث تلقائيًا (من الـ Service) مع كل حركة صرف/إيراد/تحويل
@Entity('account_balances')
@Unique(['accountType', 'accountId'])
export class AccountBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'account_type', type: 'enum', enum: AccountKind })
  accountType: AccountKind;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({
    name: 'current_balance',
    type: 'numeric',
    precision: 18,
    scale: 2,
    default: 0,
  })
  currentBalance: number;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;
}
