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
exports.TreasuryVoucher = exports.VoucherStatus = exports.ApprovalPath = exports.PaymentMethod = exports.VoucherType = void 0;
const typeorm_1 = require("typeorm");
const currency_entity_1 = require("./currency.entity");
const branch_entity_1 = require("./branch.entity");
const bank_account_entity_1 = require("./bank-account.entity");
const e_wallet_entity_1 = require("./e-wallet.entity");
const user_entity_1 = require("./user.entity");
const voucher_line_entity_1 = require("./voucher-line.entity");
var VoucherType;
(function (VoucherType) {
    VoucherType["EXPENSE"] = "expense";
    VoucherType["REVENUE"] = "revenue";
})(VoucherType || (exports.VoucherType = VoucherType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["BANK"] = "bank";
    PaymentMethod["WALLET"] = "wallet";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var ApprovalPath;
(function (ApprovalPath) {
    ApprovalPath["ADMIN_MANAGER"] = "admin_manager";
    ApprovalPath["PRODUCTION_MANAGER"] = "production_manager";
})(ApprovalPath || (exports.ApprovalPath = ApprovalPath = {}));
var VoucherStatus;
(function (VoucherStatus) {
    VoucherStatus["DRAFT"] = "draft";
    VoucherStatus["PENDING_FIRST_APPROVAL"] = "pending_first_approval";
    VoucherStatus["PENDING_FINANCIAL_REVIEW"] = "pending_financial_review";
    VoucherStatus["PENDING_GM_APPROVAL"] = "pending_gm_approval";
    VoucherStatus["APPROVED_FINAL"] = "approved_final";
    VoucherStatus["DISBURSED"] = "disbursed";
    VoucherStatus["REJECTED"] = "rejected";
})(VoucherStatus || (exports.VoucherStatus = VoucherStatus = {}));
let TreasuryVoucher = class TreasuryVoucher {
};
exports.TreasuryVoucher = TreasuryVoucher;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TreasuryVoucher.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'voucher_type', type: 'enum', enum: VoucherType }),
    __metadata("design:type", String)
], TreasuryVoucher.prototype, "voucherType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'serial_number', unique: true, length: 30 }),
    __metadata("design:type", String)
], TreasuryVoucher.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'voucher_date', type: 'date' }),
    __metadata("design:type", String)
], TreasuryVoucher.prototype, "voucherDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => currency_entity_1.Currency),
    (0, typeorm_1.JoinColumn)({ name: 'currency_id' }),
    __metadata("design:type", currency_entity_1.Currency)
], TreasuryVoucher.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', type: 'enum', enum: PaymentMethod }),
    __metadata("design:type", String)
], TreasuryVoucher.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'branch_id' }),
    __metadata("design:type", branch_entity_1.Branch)
], TreasuryVoucher.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_account_entity_1.BankAccount, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'bank_account_id' }),
    __metadata("design:type", bank_account_entity_1.BankAccount)
], TreasuryVoucher.prototype, "bankAccount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => e_wallet_entity_1.EWallet, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'wallet_id' }),
    __metadata("design:type", e_wallet_entity_1.EWallet)
], TreasuryVoucher.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'approval_path',
        type: 'enum',
        enum: ApprovalPath,
        nullable: true,
    }),
    __metadata("design:type", String)
], TreasuryVoucher.prototype, "approvalPath", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: VoucherStatus,
        default: VoucherStatus.DRAFT,
    }),
    __metadata("design:type", String)
], TreasuryVoucher.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_amount',
        type: 'numeric',
        precision: 18,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], TreasuryVoucher.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], TreasuryVoucher.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TreasuryVoucher.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_deleted', default: false }),
    __metadata("design:type", Boolean)
], TreasuryVoucher.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TreasuryVoucher, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'duplicated_from_id' }),
    __metadata("design:type", TreasuryVoucher)
], TreasuryVoucher.prototype, "duplicatedFrom", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'disbursed_by' }),
    __metadata("design:type", user_entity_1.User)
], TreasuryVoucher.prototype, "disbursedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disbursed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TreasuryVoucher.prototype, "disbursedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => voucher_line_entity_1.VoucherLine, (line) => line.voucher, { cascade: true }),
    __metadata("design:type", Array)
], TreasuryVoucher.prototype, "lines", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TreasuryVoucher.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TreasuryVoucher.prototype, "updatedAt", void 0);
exports.TreasuryVoucher = TreasuryVoucher = __decorate([
    (0, typeorm_1.Entity)('treasury_vouchers')
], TreasuryVoucher);
//# sourceMappingURL=treasury-voucher.entity.js.map