import type { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { CurrentUserPayload } from '../vouchers/vouchers.service';
import { AttachableType } from '../../entities/attachment.entity';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    upload(dto: UploadAttachmentDto, file: Express.Multer.File, user: CurrentUserPayload): Promise<import("../../entities/attachment.entity").Attachment>;
    findByAttachable(attachableType: AttachableType, attachableId: number): Promise<import("../../entities/attachment.entity").Attachment[]>;
    getFile(id: number, res: Response): Promise<void>;
    remove(id: number, user: CurrentUserPayload): Promise<{
        deleted: boolean;
    }>;
}
