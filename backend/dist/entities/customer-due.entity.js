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
exports.CustomerDue = void 0;
const typeorm_1 = require("typeorm");
const customer_entity_1 = require("./customer.entity");
const vendor_due_entity_1 = require("./vendor-due.entity");
let CustomerDue = class CustomerDue {
};
exports.CustomerDue = CustomerDue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomerDue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], CustomerDue.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], CustomerDue.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], CustomerDue.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], CustomerDue.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], CustomerDue.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: vendor_due_entity_1.DueStatus, default: vendor_due_entity_1.DueStatus.PENDING }),
    __metadata("design:type", String)
], CustomerDue.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'import_batch', length: 50, nullable: true }),
    __metadata("design:type", String)
], CustomerDue.prototype, "importBatch", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CustomerDue.prototype, "createdAt", void 0);
exports.CustomerDue = CustomerDue = __decorate([
    (0, typeorm_1.Entity)('customer_dues')
], CustomerDue);
//# sourceMappingURL=customer-due.entity.js.map