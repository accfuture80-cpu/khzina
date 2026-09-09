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
exports.VoucherApproval = exports.ApprovalDecision = exports.ApprovalStep = void 0;
const typeorm_1 = require("typeorm");
const treasury_voucher_entity_1 = require("./treasury-voucher.entity");
const user_entity_1 = require("./user.entity");
var ApprovalStep;
(function (ApprovalStep) {
    ApprovalStep["FIRST_APPROVAL"] = "first_approval";
    ApprovalStep["FINANCIAL_REVIEW"] = "financial_review";
    ApprovalStep["GM_APPROVAL"] = "gm_approval";
    ApprovalStep["DISBURSEMENT"] = "disbursement";
})(ApprovalStep || (exports.ApprovalStep = ApprovalStep = {}));
var ApprovalDecision;
(function (ApprovalDecision) {
    ApprovalDecision["APPROVED"] = "approved";
    ApprovalDecision["REJECTED"] = "rejected";
})(ApprovalDecision || (exports.ApprovalDecision = ApprovalDecision = {}));
let VoucherApproval = class VoucherApproval {
};
exports.VoucherApproval = VoucherApproval;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VoucherApproval.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treasury_voucher_entity_1.TreasuryVoucher, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'voucher_id' }),
    __metadata("design:type", treasury_voucher_entity_1.TreasuryVoucher)
], VoucherApproval.prototype, "voucher", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ApprovalStep }),
    __metadata("design:type", String)
], VoucherApproval.prototype, "step", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'approver_user_id' }),
    __metadata("design:type", user_entity_1.User)
], VoucherApproval.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ApprovalDecision }),
    __metadata("design:type", String)
], VoucherApproval.prototype, "decision", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], VoucherApproval.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'decided_at' }),
    __metadata("design:type", Date)
], VoucherApproval.prototype, "decidedAt", void 0);
exports.VoucherApproval = VoucherApproval = __decorate([
    (0, typeorm_1.Entity)('voucher_approvals')
], VoucherApproval);
//# sourceMappingURL=voucher-approval.entity.js.map