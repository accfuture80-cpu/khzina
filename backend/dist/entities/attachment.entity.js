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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attachment = exports.AttachmentCategory = exports.AttachableType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var AttachableType;
(function (AttachableType) {
    AttachableType["VOUCHER"] = "voucher";
    AttachableType["SETTLEMENT"] = "settlement";
    AttachableType["TRANSFER"] = "transfer";
})(AttachableType || (exports.AttachableType = AttachableType = {}));
var AttachmentCategory;
(function (AttachmentCategory) {
    AttachmentCategory["CHEQUE"] = "cheque";
    AttachmentCategory["INVOICE"] = "invoice";
    AttachmentCategory["OTHER"] = "other";
})(AttachmentCategory || (exports.AttachmentCategory = AttachmentCategory = {}));
let Attachment = class Attachment {
};
exports.Attachment = Attachment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Attachment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attachable_type', type: 'enum', enum: AttachableType }),
    __metadata("design:type", String)
], Attachment.prototype, "attachableType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attachable_id' }),
    __metadata("design:type", Number)
], Attachment.prototype, "attachableId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AttachmentCategory,
        default: AttachmentCategory.OTHER,
    }),
    __metadata("design:type", String)
], Attachment.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_path', length: 500 }),
    __metadata("design:type", String)
], Attachment.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Attachment.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', length: 100, nullable: true }),
    __metadata("design:type", String)
], Attachment.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'uploaded_by' }),
    __metadata("design:type", user_entity_1.User)
], Attachment.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'uploaded_at' }),
    __metadata("design:type", Date)
], Attachment.prototype, "uploadedAt", void 0);
exports.Attachment = Attachment = __decorate([
    (0, typeorm_1.Entity)('attachments')
], Attachment);
//# sourceMappingURL=attachment.entity.js.map