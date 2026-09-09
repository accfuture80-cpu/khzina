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
exports.VendorDue = exports.DueStatus = void 0;
const typeorm_1 = require("typeorm");
const vendor_entity_1 = require("./vendor.entity");
var DueStatus;
(function (DueStatus) {
    DueStatus["PENDING"] = "pending";
    DueStatus["PAID"] = "paid";
})(DueStatus || (exports.DueStatus = DueStatus = {}));
let VendorDue = class VendorDue {
};
exports.VendorDue = VendorDue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VendorDue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", vendor_entity_1.Vendor)
], VendorDue.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], VendorDue.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], VendorDue.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], VendorDue.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], VendorDue.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DueStatus, default: DueStatus.PENDING }),
    __metadata("design:type", String)
], VendorDue.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'import_batch', length: 50, nullable: true }),
    __metadata("design:type", String)
], VendorDue.prototype, "importBatch", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorDue.prototype, "createdAt", void 0);
exports.VendorDue = VendorDue = __decorate([
    (0, typeorm_1.Entity)('vendor_dues')
], VendorDue);
//# sourceMappingURL=vendor-due.entity.js.map