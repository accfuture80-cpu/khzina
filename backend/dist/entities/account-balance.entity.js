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
exports.AccountBalance = void 0;
const typeorm_1 = require("typeorm");
const treasury_transfer_entity_1 = require("./treasury-transfer.entity");
let AccountBalance = class AccountBalance {
};
exports.AccountBalance = AccountBalance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AccountBalance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_type', type: 'enum', enum: treasury_transfer_entity_1.AccountKind }),
    __metadata("design:type", String)
], AccountBalance.prototype, "accountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id' }),
    __metadata("design:type", Number)
], AccountBalance.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'current_balance',
        type: 'numeric',
        precision: 18,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], AccountBalance.prototype, "currentBalance", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'last_updated' }),
    __metadata("design:type", Date)
], AccountBalance.prototype, "lastUpdated", void 0);
exports.AccountBalance = AccountBalance = __decorate([
    (0, typeorm_1.Entity)('account_balances'),
    (0, typeorm_1.Unique)(['accountType', 'accountId'])
], AccountBalance);
//# sourceMappingURL=account-balance.entity.js.map