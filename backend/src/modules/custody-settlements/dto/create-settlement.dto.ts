import {
  IsArray,
  IsDateString,
  IsInt,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SettlementLineDto } from './settlement-line.dto';

export class CreateSettlementDto {
  // بند العهدة/السلفة الأصلية (من voucher_lines) اللي بتتسوى
  @IsInt()
  custodyVoucherLineId: number;

  @IsInt()
  employeeId: number;

  @IsDateString()
  settlementDate: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SettlementLineDto)
  lines: SettlementLineDto[];
}
