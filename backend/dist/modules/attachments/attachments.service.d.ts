import { Repository } from 'typeorm';
import { Attachment, AttachableType } from '../../entities/attachment.entity';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { CurrentUserPayload } from '../vouchers/vouchers.service';
export declare class AttachmentsService {
    private readonly attachmentRepo;
    constructor(attachmentRepo: Repository<Attachment>);
    create(dto: UploadAttachmentDto, file: Express.Multer.File, currentUser: CurrentUserPayload): Promise<Attachment>;
    findByAttachable(attachableType: AttachableType, attachableId: number): Promise<Attachment[]>;
    findOneOrFail(id: number): Promise<Attachment>;
    remove(id: number, currentUser: CurrentUserPayload): Promise<{
        deleted: boolean;
    }>;
}
