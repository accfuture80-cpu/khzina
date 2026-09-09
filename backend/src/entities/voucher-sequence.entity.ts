import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('voucher_sequences')
export class VoucherSequence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'voucher_type', length: 20 })
  voucherType: string; // expense / revenue

  @Column()
  year: number;

  @Column({ name: 'last_number', default: 0 })
  lastNumber: number;
}
