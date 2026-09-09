import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { Attachment, AttachableType } from '../../entities/attachment.entity';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { CurrentUserPayload } from '../vouchers/vouchers.service';
import { FULL_ACCESS_ROLES } from '../auth/guards/roles.guard';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
  ) {}

  async create(
    dto: UploadAttachmentDto,
    file: Express.Multer.File,
    currentUser: CurrentUserPayload,
  ) {
    const attachment = this.attachmentRepo.create({
      attachableType: dto.attachableType,
      attachableId: dto.attachableId,
      category: dto.category,
      filePath: file.path,
      originalName: file.originalname,
      mimeType: file.mimetype,
      uploadedBy: { id: currentUser.userId } as any,
    });
    return this.attachmentRepo.save(attachment);
  }

  async findByAttachable(attachableType: AttachableType, attachableId: number) {
    return this.attachmentRepo.find({
      where: { attachableType, attachableId },
      relations: ['uploadedBy'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async findOneOrFail(id: number) {
    const attachment = await this.attachmentRepo.findOne({ where: { id } });
    if (!attachment) {
      throw new NotFoundException('المرفق ده مش موجود');
    }
    return attachment;
  }

  async remove(id: number, currentUser: CurrentUserPayload) {
    const attachment = await this.attachmentRepo.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });
    if (!attachment) {
      throw new NotFoundException('المرفق ده مش موجود');
    }

    const hasFullAccess = currentUser.roles.some((r) => FULL_ACCESS_ROLES.includes(r));
    if (!hasFullAccess && attachment.uploadedBy?.id !== currentUser.userId) {
      throw new ForbiddenException('تقدر تمسح بس المرفقات اللي انت رفعتها');
    }

    // نمسح الملف من الديسك (لو موجود) وبعدين السجل من القاعدة
    fs.unlink(attachment.filePath, () => {
      /* لو الملف مش موجود أصلًا، نتجاهل الخطأ ونكمل مسح السجل */
    });

    await this.attachmentRepo.remove(attachment);
    return { deleted: true };
  }
}
