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
exports.Check = exports.CheckStatus = exports.CheckDirection = void 0;
const typeorm_1 = require("typeorm");
const vendor_entity_1 = require("./vendor.entity");
const customer_entity_1 = require("./customer.entity");
const bank_account_entity_1 = require("./bank-account.entity");
var CheckDirection;
(function (CheckDirection) {
    CheckDirection["RECEIVABLE"] = "receivable";
    CheckDirection["PAYABLE"] = "payable";
})(CheckDirection || (exports.CheckDirection = CheckDirection = {}));
var CheckStatus;
(function (CheckStatus) {
    CheckStatus["PENDING"] = "pending";
    CheckStatus["COLLECTED"] = "collected";
    CheckStatus["BOUNCED"] = "bounced";
})(CheckStatus || (exports.CheckStatus = CheckStatus = {}));
let Check = class Check {
};
exports.Check = Check;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Check.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'check_number', length: 50 }),
    __metadata("design:type", String)
], Check.prototype, "checkNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CheckDirection }),
    __metadata("design:type", String)
], Check.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", vendor_entity_1.Vendor)
], Check.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Check.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_account_entity_1.BankAccount, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'bank_account_id' }),
    __metadata("design:type", bank_account_entity_1.BankAccount)
], Check.prototype, "bankAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', length: 150, nullable: true }),
    __metadata("design:type", String)
], Check.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date' }),
    __metadata("design:type", String)
], Check.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], Check.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CheckStatus, default: CheckStatus.PENDING }),
    __metadata("design:type", String)
], Check.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Check.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Check.prototype, "createdAt", void 0);
exports.Check = Check = __decorate([
    (0, typeorm_1.Entity)('checks')
], Check);
//# sourceMappingURL=check.entity.js.map