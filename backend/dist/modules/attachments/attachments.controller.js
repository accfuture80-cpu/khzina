"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
const attachments_service_1 = require("./attachments.service");
const upload_attachment_dto_1 = require("./dto/upload-attachment.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const attachment_entity_1 = require("../../entities/attachment.entity");
const UPLOAD_ROOT = (0, path_1.join)(process.cwd(), 'uploads', 'attachments');
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
let AttachmentsController = class AttachmentsController {
    constructor(attachmentsService) {
        this.attachmentsService = attachmentsService;
    }
    upload(dto, file, user) {
        if (!file) {
            throw new common_1.NotFoundException('لازم ترفع ملف');
        }
        return this.attachmentsService.create(dto, file, user);
    }
    findByAttachable(attachableType, attachableId) {
        return this.attachmentsService.findByAttachable(attachableType, attachableId);
    }
    async getFile(id, res) {
        const attachment = await this.attachmentsService.findOneOrFail(id);
        if (!fs.existsSync(attachment.filePath)) {
            throw new common_1.NotFoundException('الملف مش موجود على السيرفر');
        }
        res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.originalName || 'file')}"`);
        fs.createReadStream(attachment.filePath).pipe(res);
    }
    remove(id, user) {
        return this.attachmentsService.remove(id, user);
    }
};
exports.AttachmentsController = AttachmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const attachableType = req.body.attachableType || 'other';
                const attachableId = req.body.attachableId || '0';
                const dir = (0, path_1.join)(UPLOAD_ROOT, attachableType, String(attachableId));
                fs.mkdirSync(dir, { recursive: true });
                cb(null, dir);
            },
            filename: (req, file, cb) => {
                const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                cb(null, `${unique}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                return cb(new Error('الملف لازم يكون صورة (JPG/PNG/WEBP) أو PDF'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_attachment_dto_1.UploadAttachmentDto, Object, Object]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('attachableType')),
    __param(1, (0, common_1.Query)('attachableId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "findByAttachable", null);
__decorate([
    (0, common_1.Get)(':id/file'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "getFile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "remove", null);
exports.AttachmentsController = AttachmentsController = __decorate([
    (0, common_1.Controller)('attachments'),
    __metadata("design:paramtypes", [attachments_service_1.AttachmentsService])
], AttachmentsController);
//# sourceMappingURL=attachments.controller.js.map