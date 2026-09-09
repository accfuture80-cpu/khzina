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
exports.TreasuryTransfer = exports.TransferStatus = exports.AccountKind = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var AccountKind;
(function (AccountKind) {
    AccountKind["MAIN_TREASURY"] = "main_treasury";
    AccountKind["BRANCH"] = "branch";
    AccountKind["BANK"] = "bank";
    AccountKind["WALLET"] = "wallet";
})(AccountKind || (exports.AccountKind = AccountKind = {}));
var TransferStatus;
(function (TransferStatus) {
    TransferStatus["PENDING"] = "pending";
    TransferStatus["APPROVED"] = "approved";
    TransferStatus["EXECUTED"] = "executed";
})(TransferStatus || (exports.TransferStatus = TransferStatus = {}));
let TreasuryTransfer = class TreasuryTransfer {
};
exports.TreasuryTransfer = TreasuryTransfer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TreasuryTransfer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'serial_number', unique: true, length: 30 }),
    __metadata("design:type", String)
], TreasuryTransfer.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transfer_date', type: 'date' }),
    __metadata("design:type", String)
], TreasuryTransfer.prototype, "transferDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_type', type: 'enum', enum: AccountKind }),
    __metadata("design:type", String)
], TreasuryTransfer.prototype, "fromType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_id' }),
    __metadata("design:type", Number)
], TreasuryTransfer.prototype, "fromId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_type', type: 'enum', enum: AccountKind }),
    __metadata("design:type", String)
], TreasuryTransfer.prototype, "toType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_id' }),
    __metadata("design:type", Number)
], TreasuryTransfer.prototype, "toId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], TreasuryTransfer.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'commission_amount',
        type: 'numeric',
        precision: 18,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], TreasuryTransfer.prototype, "commissionAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransferStatus,
        default: TransferStatus.PENDING,
    }),
    __metadata("design:type", String)
], TreasuryTransfer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], TreasuryTransfer.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TreasuryTransfer.prototype, "createdAt", void 0);
exports.TreasuryTransfer = TreasuryTransfer = __decorate([
    (0, typeorm_1.Entity)('treasury_transfers')
], TreasuryTransfer);
//# sourceMappingURL=treasury-transfer.entity.js.map