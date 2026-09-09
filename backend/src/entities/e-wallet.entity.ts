import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('e_wallets')
export class EWallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  code: string;

  @Column({ name: 'wallet_provider', length: 100 })
  walletProvider: string; // فودافون كاش، اتصالات كاش...

  @Column({ name: 'phone_number', length: 30 })
  phoneNumber: string;

  @Column({ name: 'owner_name', length: 150 })
  ownerName: string;

  @Column({
    name: 'opening_balance',
    type: 'numeric',
    precision: 18,
    scale: 2,
    default: 0,
  })
  openingBalance: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
