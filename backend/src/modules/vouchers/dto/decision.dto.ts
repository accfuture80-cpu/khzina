import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApprovalDecision } from '../../../entities/voucher-approval.entity';

export class DecisionDto {
  @IsEnum(ApprovalDecision)
  decision: ApprovalDecision;

  @IsOptional()
  @IsString()
  comment?: string;
}
