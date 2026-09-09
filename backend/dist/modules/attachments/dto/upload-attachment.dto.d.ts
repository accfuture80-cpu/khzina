import { AttachableType, AttachmentCategory } from '../../../entities/attachment.entity';
export declare class UploadAttachmentDto {
    attachableType: AttachableType;
    attachableId: number;
    category?: AttachmentCategory;
}
