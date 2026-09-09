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
exports.CustodySettlementsController = void 0;
const common_1 = require("@nestjs/common");
const custody_settlements_service_1 = require("./custody-settlements.service");
const create_settlement_dto_1 = require("./dto/create-settlement.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../../entities/role.entity");
let CustodySettlementsController = class CustodySettlementsController {
    constructor(settlementsService) {
        this.settlementsService = settlementsService;
    }
    create(dto, user) {
        return this.settlementsService.create(dto, user);
    }
    findAll() {
        return this.settlementsService.findAll();
    }
    getAvailableCustodyLines() {
        return this.settlementsService.getAvailableCustodyLines();
    }
    findOne(id) {
        return this.settlementsService.findOneOrFail(id);
    }
    approve(id, user) {
        return this.settlementsService.approve(id, user);
    }
};
exports.CustodySettlementsController = CustodySettlementsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleCode.ACCOUNTANT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_settlement_dto_1.CreateSettlementDto, Object]),
    __metadata("design:returntype", void 0)
], CustodySettlementsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustodySettlementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('available-custody-lines'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustodySettlementsController.prototype, "getAvailableCustodyLines", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CustodySettlementsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleCode.FINANCIAL_MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CustodySettlementsController.prototype, "approve", null);
exports.CustodySettlementsController = CustodySettlementsController = __decorate([
    (0, common_1.Controller)('custody-settlements'),
    __metadata("design:paramtypes", [custody_settlements_service_1.CustodySettlementsService])
], CustodySettlementsController);
//# sourceMappingURL=custody-settlements.controller.js.map