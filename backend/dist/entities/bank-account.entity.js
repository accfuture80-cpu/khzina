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
exports.BankAccount = void 0;
const typeorm_1 = require("typeorm");
const currency_entity_1 = require("./currency.entity");
let BankAccount = class BankAccount {
};
exports.BankAccount = BankAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BankAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 30 }),
    __metadata("design:type", String)
], BankAccount.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', length: 150 }),
    __metadata("design:type", String)
], BankAccount.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'branch_name', length: 150, nullable: true }),
    __metadata("design:type", String)
], BankAccount.prototype, "branchName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_number', length: 100 }),
    __metadata("design:type", String)
], BankAccount.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responsible_person', length: 150, nullable: true }),
    __metadata("design:type", String)
], BankAccount.prototype, "responsiblePerson", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => currency_entity_1.Currency),
    (0, typeorm_1.JoinColumn)({ name: 'currency_id' }),
    __metadata("design:type", currency_entity_1.Currency)
], BankAccount.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'opening_balance',
        type: 'numeric',
        precision: 18,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], BankAccount.prototype, "openingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], BankAccount.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BankAccount.prototype, "createdAt", void 0);
exports.BankAccount = BankAccount = __decorate([
    (0, typeorm_1.Entity)('bank_accounts')
], BankAccount);
//# sourceMappingURL=bank-account.entity.js.map