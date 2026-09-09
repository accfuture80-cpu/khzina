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
exports.CreateVoucherDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const treasury_voucher_entity_1 = require("../../../entities/treasury-voucher.entity");
const voucher_line_dto_1 = require("./voucher-line.dto");
class CreateVoucherDto {
}
exports.CreateVoucherDto = CreateVoucherDto;
__decorate([
    (0, class_validator_1.IsEnum)(treasury_voucher_entity_1.VoucherType),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "voucherType", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "voucherDate", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "currencyId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(treasury_voucher_entity_1.PaymentMethod),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "branchId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "bankAccountId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "walletId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(treasury_voucher_entity_1.ApprovalPath),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "approvalPath", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => voucher_line_dto_1.VoucherLineDto),
    __metadata("design:type", Array)
], CreateVoucherDto.prototype, "lines", void 0);
//# sourceMappingURL=create-voucher.dto.js.map