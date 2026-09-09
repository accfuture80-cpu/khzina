import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateWorkflowSettingsDto {
  @IsOptional()
  @IsBoolean()
  requireFinancialReview?: boolean;

  @IsOptional()
  @IsBoolean()
  requireGmApproval?: boolean;
}
