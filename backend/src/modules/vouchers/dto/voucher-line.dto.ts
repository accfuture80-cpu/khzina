import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { VoucherLineType } from '../../../entities/voucher-line.entity';

export class VoucherLineDto {
  @IsEnum(VoucherLineType)
  lineType: VoucherLineType;

  @IsOptional() @IsInt() mainCategoryId?: number;
  @IsOptional() @IsInt() subCategoryId?: number;
  @IsOptional() @IsInt() costCenterId?: number;
  @IsOptional() @IsInt() employeeId?: number; // للعهد/السلف
  @IsOptional() @IsInt() vehicleId?: number; // لو صرف على سيارة
  @IsOptional() @IsInt() vendorId?: number;
  @IsOptional() @IsInt() customerId?: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
