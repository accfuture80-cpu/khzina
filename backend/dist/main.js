"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
class AppLogger extends common_1.ConsoleLogger {
    log(message, context) {
        if (context === 'RouterExplorer' ||
            context === 'RoutesResolver' ||
            context === 'InstanceLoader') {
            return;
        }
        super.log(message, context);
    }
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: new AppLogger(),
    });
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 6000;
    await app.listen(port);
    console.log('');
    console.log('========================================');
    console.log(`Server running on port ${port}`);
    console.log('DB connected OK');
    console.log('========================================');
    console.log('');
}
bootstrap();
//# sourceMappingURL=main.js.map