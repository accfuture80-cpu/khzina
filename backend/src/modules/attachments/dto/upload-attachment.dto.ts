import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { AttachableType, AttachmentCategory } from '../../../entities/attachment.entity';

// ملحوظة: الفورم بيبقى multipart/form-data (فيه ملف)، فكل الحقول التانية بتوصل كـ string
// ولازم نحوّلها يدويًا للنوع الصح
export class UploadAttachmentDto {
  @IsEnum(AttachableType)
  attachableType: AttachableType;

  @Transform(({ value }) => Number(value))
  @IsInt()
  attachableId: number;

  @IsOptional()
  @IsEnum(AttachmentCategory)
  category?: AttachmentCategory;
}
