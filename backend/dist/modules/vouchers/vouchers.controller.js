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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VouchersController = void 0;
const common_1 = require("@nestjs/common");
const vouchers_service_1 = require("./vouchers.service");
const create_voucher_dto_1 = require("./dto/create-voucher.dto");
const update_voucher_dto_1 = require("./dto/update-voucher.dto");
const decision_dto_1 = require("./dto/decision.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../../entities/role.entity");
const treasury_voucher_entity_1 = require("../../entities/treasury-voucher.entity");
let VouchersController = class VouchersController {
    constructor(vouchersService) {
        this.vouchersService = vouchersService;
    }
    create(dto, user) {
        return this.vouchersService.create(dto, user);
    }
    findAll(user, status, voucherType) {
        return this.vouchersService.findAll({ status, voucherType }, user);
    }
    findOne(id) {
        return this.vouchersService.findOneOrFail(id);
    }
    getApprovalHistory(id) {
        return this.vouchersService.getApprovalHistory(id);
    }
    update(id, dto, user) {
        return this.vouchersService.update(id, dto, user);
    }
    remove(id, user) {
        return this.vouchersService.softDelete(id, user);
    }
    submit(id, user) {
        return this.vouchersService.submit(id, user);
    }
    decide(id, dto, user) {
        return this.vouchersService.decide(id, dto, user);
    }
    disburse(id, user) {
        return this.vouchersService.disburse(id, user);
    }
    duplicate(id, user) {
        return this.vouchersService.duplicate(id, user);
    }
};
exports.VouchersController = VouchersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleCode.ACCOUNTANT, role_entity_1.RoleCode.ADMIN_MANAGER, role_entity_1.RoleCode.PRODUCTION_MANAGER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_voucher_dto_1.CreateVoucherDto, Object]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('voucherType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/approvals'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "getApprovalHistory", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_voucher_dto_1.UpdateVoucherDto, Object]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleCode.ACCOUNTANT, role_entity_1.RoleCode.ADMIN_MANAGER, role_entity_1.RoleCode.PRODUCTION_MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/decide'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, decision_dto_1.DecisionDto, Object]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "decide", null);
__decorate([
    (0, common_1.Post)(':id/disburse'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleCode.TREASURY_ACCOUNTANT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "disburse", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleCode.ACCOUNTANT, role_entity_1.RoleCode.TREASURY_ACCOUNTANT, role_entity_1.RoleCode.FINANCIAL_MANAGER, role_entity_1.RoleCode.SYSTEM_ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "duplicate", null);
exports.VouchersController = VouchersController = __decorate([
    (0, common_1.Controller)('vouchers'),
    __metadata("design:paramtypes", [vouchers_service_1.VouchersService])
], VouchersController);
//# sourceMappingURL=vouchers.controller.js.map