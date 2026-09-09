import { IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class SettlementLineDto {
  @IsOptional() @IsInt() mainCategoryId?: number;
  @IsOptional() @IsInt() subCategoryId?: number;
  @IsOptional() @IsInt() costCenterId?: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
