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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
const update_settings_dto_1 = require("./dto/update-settings.dto");
const update_workflow_settings_dto_1 = require("./dto/update-workflow-settings.dto");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../../entities/role.entity");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    get() {
        return this.settingsService.get();
    }
    update(dto) {
        return this.settingsService.update(dto);
    }
    getWorkflowSettings() {
        return this.settingsService.getWorkflowSettings();
    }
    updateWorkflowSettings(dto) {
        return this.settingsService.updateWorkflowSettings(dto);
    }
    resetSystem() {
        return this.settingsService.resetSystem();
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleCode.SYSTEM_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_settings_dto_1.UpdateSettingsDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('workflow'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getWorkflowSettings", null);
__decorate([
    (0, common_1.Patch)('workflow'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleCode.SYSTEM_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_workflow_settings_dto_1.UpdateWorkflowSettingsDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateWorkflowSettings", null);
__decorate([
    (0, common_1.Post)('reset-system'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleCode.SYSTEM_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "resetSystem", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map