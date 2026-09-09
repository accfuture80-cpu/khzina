import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { CheckDirection } from '../../../entities/check.entity';

export class CreateCheckDto {
  @IsString()
  checkNumber: string;

  @IsEnum(CheckDirection)
  direction: CheckDirection;

  @IsOptional() @IsInt() vendorId?: number;
  @IsOptional() @IsInt() customerId?: number;
  @IsOptional() @IsInt() bankAccountId?: number;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
