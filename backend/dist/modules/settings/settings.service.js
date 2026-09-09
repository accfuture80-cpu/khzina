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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const system_settings_entity_1 = require("../../entities/system-settings.entity");
const workflow_settings_entity_1 = require("../../entities/workflow-settings.entity");
let SettingsService = class SettingsService {
    constructor(repo, workflowRepo, dataSource) {
        this.repo = repo;
        this.workflowRepo = workflowRepo;
        this.dataSource = dataSource;
    }
    async get() {
        let settings = await this.repo.findOne({ where: {} });
        if (!settings) {
            settings = await this.repo.save(this.repo.create({ companyName: 'اسم الشركة' }));
        }
        return settings;
    }
    async update(dto) {
        const settings = await this.get();
        Object.assign(settings, dto);
        return this.repo.save(settings);
    }
    async getWorkflowSettings() {
        let settings = await this.workflowRepo.findOne({ where: {} });
        if (!settings) {
            settings = await this.workflowRepo.save(this.workflowRepo.create({}));
        }
        return settings;
    }
    async updateWorkflowSettings(dto) {
        const settings = await this.getWorkflowSettings();
        Object.assign(settings, dto);
        return this.workflowRepo.save(settings);
    }
    async resetSystem() {
        await this.dataSource.query(`
      TRUNCATE TABLE
        activity_logs,
        attachments,
        voucher_approvals,
        custody_settlement_lines,
        custody_settlements,
        voucher_lines,
        treasury_vouchers,
        treasury_transfers,
        account_balances,
        voucher_sequences,
        vendor_dues,
        customer_dues,
        checks
      RESTART IDENTITY CASCADE;
    `);
        return { message: 'تم تصفير النظام بنجاح - كل الأذون والحركات والأرصدة اتمسحت والتكويد الأساسي والمستخدمين فضلوا زي ما هما' };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(system_settings_entity_1.SystemSettings)),
    __param(1, (0, typeorm_1.InjectRepository)(workflow_settings_entity_1.WorkflowSettings)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], SettingsService);
//# sourceMappingURL=settings.service.js.map