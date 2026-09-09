import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { CustodySettlementsModule } from './modules/custody-settlements/custody-settlements.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UsersAdminModule } from './modules/users-admin/users-admin.module';
import { SettingsModule } from './modules/settings/settings.module';
import { RolesModule } from './modules/roles/roles.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { DuesModule } from './modules/dues/dues.module';
import { ChecksModule } from './modules/checks/checks.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // متاح في كل الموديولز من غير ما نعمل import في كل واحد
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: false,
        // كل استعلام كان بيتطبع كامل في التيرمنال ويعمل زحمة تخلّي أي خطأ حقيقي يضيع وسطها
        // دلوقتي بيطبع بس الأخطاء والتحذيرات
        logging: ['error', 'warn'],
      }),
    }),
    UsersModule,
    AuthModule,
    VouchersModule,
    CustodySettlementsModule,
    TransfersModule,
    MasterDataModule,
    ReportsModule,
    UsersAdminModule,
    SettingsModule,
    RolesModule,
    AttachmentsModule,
    DuesModule,
    ChecksModule,
  ],
  providers: [
    // كل الـ Endpoints محمية تلقائيًا بتوكن JWT إلا لو معلّمة بـ @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // بعد التأكد من التوكن، بيتحقق من الدور المطلوب لو الـ Endpoint معلّم بـ @Roles(...)
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
