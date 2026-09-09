import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { AccountKind } from '../../../entities/treasury-transfer.entity';

export class CreateTransferDto {
  @IsDateString()
  transferDate: string;

  @IsEnum(AccountKind)
  fromType: AccountKind;

  @IsInt()
  fromId: number;

  @IsEnum(AccountKind)
  toType: AccountKind;

  @IsInt()
  toId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionAmount?: number;
}
