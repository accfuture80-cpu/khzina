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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const treasury_transfer_entity_1 = require("../../entities/treasury-transfer.entity");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getAccountStatement(accountType, accountId, fromDate, toDate) {
        if (!accountType || !accountId) {
            throw new common_1.BadRequestException('لازم تحدد نوع الحساب ورقمه');
        }
        return this.reportsService.getAccountStatement(accountType, parseInt(accountId, 10), fromDate, toDate);
    }
    getVendorsStatement(fromDate, toDate) {
        return this.reportsService.getVendorsStatement(fromDate, toDate);
    }
    getCustomersStatement(fromDate, toDate) {
        return this.reportsService.getCustomersStatement(fromDate, toDate);
    }
    getCustodySettlementsStatement(fromDate, toDate) {
        return this.reportsService.getCustodySettlementsStatement(fromDate, toDate);
    }
    getExpensesReport(fromDate, toDate) {
        return this.reportsService.getExpensesReport(fromDate, toDate);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('account-statement'),
    __param(0, (0, common_1.Query)('accountType')),
    __param(1, (0, common_1.Query)('accountId')),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getAccountStatement", null);
__decorate([
    (0, common_1.Get)('vendors-statement'),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getVendorsStatement", null);
__decorate([
    (0, common_1.Get)('customers-statement'),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCustomersStatement", null);
__decorate([
    (0, common_1.Get)('custody-settlements-statement'),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCustodySettlementsStatement", null);
__decorate([
    (0, common_1.Get)('expenses-report'),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getExpensesReport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map