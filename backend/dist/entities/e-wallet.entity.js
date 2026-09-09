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
exports.EWallet = void 0;
const typeorm_1 = require("typeorm");
let EWallet = class EWallet {
};
exports.EWallet = EWallet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EWallet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 30 }),
    __metadata("design:type", String)
], EWallet.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wallet_provider', length: 100 }),
    __metadata("design:type", String)
], EWallet.prototype, "walletProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', length: 30 }),
    __metadata("design:type", String)
], EWallet.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_name', length: 150 }),
    __metadata("design:type", String)
], EWallet.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'opening_balance',
        type: 'numeric',
        precision: 18,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], EWallet.prototype, "openingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], EWallet.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EWallet.prototype, "createdAt", void 0);
exports.EWallet = EWallet = __decorate([
    (0, typeorm_1.Entity)('e_wallets')
], EWallet);
//# sourceMappingURL=e-wallet.entity.js.map