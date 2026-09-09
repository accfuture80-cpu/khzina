"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const vouchers_module_1 = require("./modules/vouchers/vouchers.module");
const custody_settlements_module_1 = require("./modules/custody-settlements/custody-settlements.module");
const transfers_module_1 = require("./modules/transfers/transfers.module");
const master_data_module_1 = require("./modules/master-data/master-data.module");
const reports_module_1 = require("./modules/reports/reports.module");
const users_admin_module_1 = require("./modules/users-admin/users-admin.module");
const settings_module_1 = require("./modules/settings/settings.module");
const roles_module_1 = require("./modules/roles/roles.module");
const attachments_module_1 = require("./modules/attachments/attachments.module");
const dues_module_1 = require("./modules/dues/dues.module");
const checks_module_1 = require("./modules/checks/checks.module");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./modules/auth/guards/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST'),
                    port: config.get('DB_PORT'),
                    username: config.get('DB_USERNAME'),
                    password: config.get('DB_PASSWORD'),
                    database: config.get('DB_DATABASE'),
                    entities: [__dirname + '/entities/*.entity{.ts,.js}'],
                    synchronize: false,
                    logging: ['error', 'warn'],
                }),
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            vouchers_module_1.VouchersModule,
            custody_settlements_module_1.CustodySettlementsModule,
            transfers_module_1.TransfersModule,
            master_data_module_1.MasterDataModule,
            reports_module_1.ReportsModule,
            users_admin_module_1.UsersAdminModule,
            settings_module_1.SettingsModule,
            roles_module_1.RolesModule,
            attachments_module_1.AttachmentsModule,
            dues_module_1.DuesModule,
            checks_module_1.ChecksModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map