import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 10 })
  code: string; // EGP, USD, EUR

  @Column({ length: 50 })
  name: string;

  @Column({ length: 10, nullable: true })
  symbol: string;
}
