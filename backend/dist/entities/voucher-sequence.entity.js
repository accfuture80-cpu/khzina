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
exports.VoucherSequence = void 0;
const typeorm_1 = require("typeorm");
let VoucherSequence = class VoucherSequence {
};
exports.VoucherSequence = VoucherSequence;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VoucherSequence.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'voucher_type', length: 20 }),
    __metadata("design:type", String)
], VoucherSequence.prototype, "voucherType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], VoucherSequence.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_number', default: 0 }),
    __metadata("design:type", Number)
], VoucherSequence.prototype, "lastNumber", void 0);
exports.VoucherSequence = VoucherSequence = __decorate([
    (0, typeorm_1.Entity)('voucher_sequences')
], VoucherSequence);
//# sourceMappingURL=voucher-sequence.entity.js.map