"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const vendor_due_entity_1 = require("../../entities/vendor-due.entity");
const customer_due_entity_1 = require("../../entities/customer-due.entity");
const vendor_entity_1 = require("../../entities/vendor.entity");
const customer_entity_1 = require("../../entities/customer.entity");
const dues_service_1 = require("./dues.service");
const dues_controller_1 = require("./dues.controller");
let DuesModule = class DuesModule {
};
exports.DuesModule = DuesModule;
exports.DuesModule = DuesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([vendor_due_entity_1.VendorDue, customer_due_entity_1.CustomerDue, vendor_entity_1.Vendor, customer_entity_1.Customer])],
        controllers: [dues_controller_1.DuesController],
        providers: [dues_service_1.DuesService],
    })
], DuesModule);
//# sourceMappingURL=dues.module.js.map