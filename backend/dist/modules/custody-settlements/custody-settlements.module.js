"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustodySettlementsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const custody_settlement_entity_1 = require("../../entities/custody-settlement.entity");
const custody_settlement_line_entity_1 = require("../../entities/custody-settlement-line.entity");
const voucher_line_entity_1 = require("../../entities/voucher-line.entity");
const custody_settlements_service_1 = require("./custody-settlements.service");
const custody_settlements_controller_1 = require("./custody-settlements.controller");
const common_module_1 = require("../common/common.module");
let CustodySettlementsModule = class CustodySettlementsModule {
};
exports.CustodySettlementsModule = CustodySettlementsModule;
exports.CustodySettlementsModule = CustodySettlementsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([custody_settlement_entity_1.CustodySettlement, custody_settlement_line_entity_1.CustodySettlementLine, voucher_line_entity_1.VoucherLine]),
            common_module_1.CommonModule,
        ],
        controllers: [custody_settlements_controller_1.CustodySettlementsController],
        providers: [custody_settlements_service_1.CustodySettlementsService],
    })
], CustodySettlementsModule);
//# sourceMappingURL=custody-settlements.module.js.map