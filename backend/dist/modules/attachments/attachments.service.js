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
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs = require("fs");
const attachment_entity_1 = require("../../entities/attachment.entity");
const roles_guard_1 = require("../auth/guards/roles.guard");
let AttachmentsService = class AttachmentsService {
    constructor(attachmentRepo) {
        this.attachmentRepo = attachmentRepo;
    }
    async create(dto, file, currentUser) {
        const attachment = this.attachmentRepo.create({
            attachableType: dto.attachableType,
            attachableId: dto.attachableId,
            category: dto.category,
            filePath: file.path,
            originalName: file.originalname,
            mimeType: file.mimetype,
            uploadedBy: { id: currentUser.userId },
        });
        return this.attachmentRepo.save(attachment);
    }
    async findByAttachable(attachableType, attachableId) {
        return this.attachmentRepo.find({
            where: { attachableType, attachableId },
            relations: ['uploadedBy'],
            order: { uploadedAt: 'DESC' },
        });
    }
    async findOneOrFail(id) {
        const attachment = await this.attachmentRepo.findOne({ where: { id } });
        if (!attachment) {
            throw new common_1.NotFoundException('المرفق ده مش موجود');
        }
        return attachment;
    }
    async remove(id, currentUser) {
        const attachment = await this.attachmentRepo.findOne({
            where: { id },
            relations: ['uploadedBy'],
        });
        if (!attachment) {
            throw new common_1.NotFoundException('المرفق ده مش موجود');
        }
        const hasFullAccess = currentUser.roles.some((r) => roles_guard_1.FULL_ACCESS_ROLES.includes(r));
        if (!hasFullAccess && attachment.uploadedBy?.id !== currentUser.userId) {
            throw new common_1.ForbiddenException('تقدر تمسح بس المرفقات اللي انت رفعتها');
        }
        fs.unlink(attachment.filePath, () => {
        });
        await this.attachmentRepo.remove(attachment);
        return { deleted: true };
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map