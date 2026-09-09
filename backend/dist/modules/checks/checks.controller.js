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
exports.ChecksController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const checks_service_1 = require("./checks.service");
const create_check_dto_1 = require("./dto/create-check.dto");
const check_entity_1 = require("../../entities/check.entity");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../../entities/role.entity");
const CAN_MANAGE = [role_entity_1.RoleCode.ACCOUNTANT, role_entity_1.RoleCode.TREASURY_ACCOUNTANT, role_entity_1.RoleCode.SYSTEM_ADMIN];
let ChecksController = class ChecksController {
    constructor(checksService) {
        this.checksService = checksService;
    }
    findAll() {
        return this.checksService.findAll();
    }
    getDashboardTotals() {
        return this.checksService.getDashboardTotals();
    }
    findOne(id) {
        return this.checksService.findOneOrFail(id);
    }
    create(dto) {
        return this.checksService.create(dto);
    }
    async importChecks(file) {
        if (!file)
            throw new common_1.BadRequestException('لازم ترفع ملف إكسيل');
        return this.checksService.importChecksFromExcel(file.buffer);
    }
    markCollected(id) {
        return this.checksService.updateStatus(id, check_entity_1.CheckStatus.COLLECTED);
    }
    markBounced(id) {
        return this.checksService.updateStatus(id, check_entity_1.CheckStatus.BOUNCED);
    }
    remove(id) {
        return this.checksService.remove(id);
    }
};
exports.ChecksController = ChecksController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChecksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dashboard-totals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChecksController.prototype, "getDashboardTotals", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChecksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(...CAN_MANAGE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_check_dto_1.CreateCheckDto]),
    __metadata("design:returntype", void 0)
], ChecksController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)(...CAN_MANAGE),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChecksController.prototype, "importChecks", null);
__decorate([
    (0, common_1.Patch)(':id/mark-collected'),
    (0, roles_decorator_1.Roles)(...CAN_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChecksController.prototype, "markCollected", null);
__decorate([
    (0, common_1.Patch)(':id/mark-bounced'),
    (0, roles_decorator_1.Roles)(...CAN_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChecksController.prototype, "markBounced", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(...CAN_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChecksController.prototype, "remove", null);
exports.ChecksController = ChecksController = __decorate([
    (0, common_1.Controller)('checks'),
    __metadata("design:paramtypes", [checks_service_1.ChecksService])
], ChecksController);
//# sourceMappingURL=checks.controller.js.map