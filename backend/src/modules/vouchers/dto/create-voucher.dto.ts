import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VoucherType,
  PaymentMethod,
  ApprovalPath,
} from '../../../entities/treasury-voucher.entity';
import { VoucherLineDto } from './voucher-line.dto';

export class CreateVoucherDto {
  @IsEnum(VoucherType)
  voucherType: VoucherType;

  @IsDateString()
  voucherDate: string;

  @IsInt()
  currencyId: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional() @IsInt() branchId?: number; // لو نقدي
  @IsOptional() @IsInt() bankAccountId?: number; // لو بنك
  @IsOptional() @IsInt() walletId?: number; // لو محفظة

  // إجباري لإذن الصرف فقط - المحاسب بيختار المسار وقت الإعداد
  @IsOptional()
  @IsEnum(ApprovalPath)
  approvalPath?: ApprovalPath;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VoucherLineDto)
  lines: VoucherLineDto[];
}
