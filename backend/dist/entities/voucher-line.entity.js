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
exports.VoucherLine = exports.VoucherLineType = void 0;
const typeorm_1 = require("typeorm");
const treasury_voucher_entity_1 = require("./treasury-voucher.entity");
const expense_category_main_entity_1 = require("./expense-category-main.entity");
const expense_category_sub_entity_1 = require("./expense-category-sub.entity");
const cost_center_entity_1 = require("./cost-center.entity");
const employee_entity_1 = require("./employee.entity");
const vehicle_entity_1 = require("./vehicle.entity");
const vendor_entity_1 = require("./vendor.entity");
const customer_entity_1 = require("./customer.entity");
var VoucherLineType;
(function (VoucherLineType) {
    VoucherLineType["EXPENSE"] = "expense";
    VoucherLineType["CUSTODY_ADVANCE"] = "custody_advance";
    VoucherLineType["VENDOR_PAYMENT"] = "vendor_payment";
    VoucherLineType["OTHER_REVENUE"] = "other_revenue";
    VoucherLineType["CUSTOMER_COLLECTION"] = "customer_collection";
    VoucherLineType["CUSTODY_REPAYMENT"] = "custody_repayment";
    VoucherLineType["BANK_COMMISSION"] = "bank_commission";
    VoucherLineType["TRANSFER"] = "transfer";
    VoucherLineType["TREASURY_FUNDING"] = "treasury_funding";
})(VoucherLineType || (exports.VoucherLineType = VoucherLineType = {}));
let VoucherLine = class VoucherLine {
};
exports.VoucherLine = VoucherLine;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VoucherLine.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treasury_voucher_entity_1.TreasuryVoucher, (voucher) => voucher.lines, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'voucher_id' }),
    __metadata("design:type", treasury_voucher_entity_1.TreasuryVoucher)
], VoucherLine.prototype, "voucher", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_type', type: 'enum', enum: VoucherLineType }),
    __metadata("design:type", String)
], VoucherLine.prototype, "lineType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => expense_category_main_entity_1.ExpenseCategoryMain, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'main_category_id' }),
    __metadata("design:type", expense_category_main_entity_1.ExpenseCategoryMain)
], VoucherLine.prototype, "mainCategory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => expense_category_sub_entity_1.ExpenseCategorySub, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sub_category_id' }),
    __metadata("design:type", expense_category_sub_entity_1.ExpenseCategorySub)
], VoucherLine.prototype, "subCategory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cost_center_entity_1.CostCenter, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'cost_center_id' }),
    __metadata("design:type", cost_center_entity_1.CostCenter)
], VoucherLine.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], VoucherLine.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.Vehicle, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicle_id' }),
    __metadata("design:type", vehicle_entity_1.Vehicle)
], VoucherLine.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", vendor_entity_1.Vendor)
], VoucherLine.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], VoucherLine.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], VoucherLine.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], VoucherLine.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VoucherLine.prototype, "createdAt", void 0);
exports.VoucherLine = VoucherLine = __decorate([
    (0, typeorm_1.Entity)('voucher_lines')
], VoucherLine);
//# sourceMappingURL=voucher-line.entity.js.map