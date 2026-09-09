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
exports.CustodySettlementLine = void 0;
const typeorm_1 = require("typeorm");
const custody_settlement_entity_1 = require("./custody-settlement.entity");
const expense_category_main_entity_1 = require("./expense-category-main.entity");
const expense_category_sub_entity_1 = require("./expense-category-sub.entity");
const cost_center_entity_1 = require("./cost-center.entity");
let CustodySettlementLine = class CustodySettlementLine {
};
exports.CustodySettlementLine = CustodySettlementLine;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustodySettlementLine.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => custody_settlement_entity_1.CustodySettlement, (settlement) => settlement.lines, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'settlement_id' }),
    __metadata("design:type", custody_settlement_entity_1.CustodySettlement)
], CustodySettlementLine.prototype, "settlement", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => expense_category_main_entity_1.ExpenseCategoryMain, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'main_category_id' }),
    __metadata("design:type", expense_category_main_entity_1.ExpenseCategoryMain)
], CustodySettlementLine.prototype, "mainCategory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => expense_category_sub_entity_1.ExpenseCategorySub, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sub_category_id' }),
    __metadata("design:type", expense_category_sub_entity_1.ExpenseCategorySub)
], CustodySettlementLine.prototype, "subCategory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cost_center_entity_1.CostCenter, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'cost_center_id' }),
    __metadata("design:type", cost_center_entity_1.CostCenter)
], CustodySettlementLine.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], CustodySettlementLine.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], CustodySettlementLine.prototype, "description", void 0);
exports.CustodySettlementLine = CustodySettlementLine = __decorate([
    (0, typeorm_1.Entity)('custody_settlement_lines')
], CustodySettlementLine);
//# sourceMappingURL=custody-settlement-line.entity.js.map