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
exports.DuesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const dues_service_1 = require("./dues.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../../entities/role.entity");
const CAN_MANAGE = [role_entity_1.RoleCode.ACCOUNTANT, role_entity_1.RoleCode.TREASURY_ACCOUNTANT, role_entity_1.RoleCode.SYSTEM_ADMIN];
let DuesController = class DuesController {
    constructor(duesService) {
        this.duesService = duesService;
    }
    findAllVendorDues() {
        return this.duesService.findAllVendorDues();
    }
    findAllCustomerDues() {
        return this.duesService.findAllCustomerDues();
    }
    getDashboardTotals() {
        return this.duesService.getDashboardTotals();
    }
    async importVendorDues(file) {
        if (!file)
            throw new common_1.BadRequestException('لازم ترفع ملف إكسيل');
        return this.duesService.importVendorDues(file.buffer);
    }
    async importCustomerDues(file) {
        if (!file)
            throw new common_1.BadRequestException('لازم ترفع ملف إكسيل');
        return this.duesService.importCustomerDues(file.buffer);
    }
    markVendorDuePaid(id) {
        return this.duesService.markVendorDuePaid(id);
    }
    markCustomerDuePaid(id) {
        return this.duesService.markCustomerDuePaid(id);
    }
};
exports.DuesController = DuesController;
__decorate([
    (0, common_1.Get)('vendors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DuesController.prototype, "findAllVendorDues", null);
__decorate([
    (0, common_1.Get)('customers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DuesController.prototype, "findAllCustomerDues", null);
__decorate([
    (0, common_1.Get)('dashboard-totals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DuesController.prototype, "getDashboardTotals", null);
__decorate([
    (0, common_1.Post)('vendors/import'),
    (0, roles_decorator_1.Roles)(...CAN_MANAGE),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DuesController.prototype, "importVendorDues", null);
__decorate([
    (0, common_1.Post)('customers/import'),
    (0, roles_decorator_1.Roles)(...CAN_MANAGE),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DuesController.prototype, "importCustomerDues", null);
__decorate([
    (0, common_1.Patch)('vendors/:id/mark-paid'),
    (0, roles_decorator_1.Roles)(...CAN_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DuesController.prototype, "markVendorDuePaid", null);
__decorate([
    (0, common_1.Patch)('customers/:id/mark-paid'),
    (0, roles_decorator_1.Roles)(...CAN_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DuesController.prototype, "markCustomerDuePaid", null);
exports.DuesController = DuesController = __decorate([
    (0, common_1.Controller)('dues'),
    __metadata("design:paramtypes", [dues_service_1.DuesService])
], DuesController);
//# sourceMappingURL=dues.controller.js.map