import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import type { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserPayload } from '../vouchers/vouchers.service';
import { AttachableType } from '../../entities/attachment.entity';

const UPLOAD_ROOT = join(process.cwd(), 'uploads', 'attachments');

// أنواع الملفات المسموح رفعها بس: صور (شيكات/فواتير ممسوحة ضوئيًا) وPDF
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // بنعمل فولدر منفصل لكل نوع/رقم (مثلاً uploads/attachments/voucher/12)
          const attachableType = req.body.attachableType || 'other';
          const attachableId = req.body.attachableId || '0';
          const dir = join(UPLOAD_ROOT, attachableType, String(attachableId));
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 ميجا لكل ملف
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(new Error('الملف لازم يكون صورة (JPG/PNG/WEBP) أو PDF'), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @Body() dto: UploadAttachmentDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!file) {
      throw new NotFoundException('لازم ترفع ملف');
    }
    return this.attachmentsService.create(dto, file, user);
  }

  @Get()
  findByAttachable(
    @Query('attachableType') attachableType: AttachableType,
    @Query('attachableId', ParseIntPipe) attachableId: number,
  ) {
    return this.attachmentsService.findByAttachable(attachableType, attachableId);
  }

  // بث الملف نفسه للعرض/التحميل - inline عشان يفتح في المتصفح بدل ما ينزل فورًا
  @Get(':id/file')
  async getFile(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const attachment = await this.attachmentsService.findOneOrFail(id);
    if (!fs.existsSync(attachment.filePath)) {
      throw new NotFoundException('الملف مش موجود على السيرفر');
    }
    res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(attachment.originalName || 'file')}"`,
    );
    fs.createReadStream(attachment.filePath).pipe(res);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.attachmentsService.remove(id, user);
  }
}
