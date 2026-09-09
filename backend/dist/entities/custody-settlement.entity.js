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
exports.CustodySettlement = exports.SettlementStatus = void 0;
const typeorm_1 = require("typeorm");
const voucher_line_entity_1 = require("./voucher-line.entity");
const employee_entity_1 = require("./employee.entity");
const user_entity_1 = require("./user.entity");
const custody_settlement_line_entity_1 = require("./custody-settlement-line.entity");
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["DRAFT"] = "draft";
    SettlementStatus["APPROVED"] = "approved";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
let CustodySettlement = class CustodySettlement {
};
exports.CustodySettlement = CustodySettlement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustodySettlement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'serial_number', unique: true, length: 30 }),
    __metadata("design:type", String)
], CustodySettlement.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => voucher_line_entity_1.VoucherLine),
    (0, typeorm_1.JoinColumn)({ name: 'custody_voucher_line_id' }),
    __metadata("design:type", voucher_line_entity_1.VoucherLine)
], CustodySettlement.prototype, "custodyVoucherLine", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], CustodySettlement.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'settlement_date', type: 'date' }),
    __metadata("design:type", String)
], CustodySettlement.prototype, "settlementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SettlementStatus, default: SettlementStatus.DRAFT }),
    __metadata("design:type", String)
], CustodySettlement.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], CustodySettlement.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => custody_settlement_line_entity_1.CustodySettlementLine, (line) => line.settlement, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CustodySettlement.prototype, "lines", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CustodySettlement.prototype, "createdAt", void 0);
exports.CustodySettlement = CustodySettlement = __decorate([
    (0, typeorm_1.Entity)('custody_settlements')
], CustodySettlement);
//# sourceMappingURL=custody-settlement.entity.js.map