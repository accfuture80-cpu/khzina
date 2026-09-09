import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

class AppLogger extends ConsoleLogger {
  log(message: any, context?: string) {
    if (
      context === 'RouterExplorer' ||
      context === 'RoutesResolver' ||
      context === 'InstanceLoader'
    ) {
      return;
    }
    super.log(message, context);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger(),
  });

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 6000;

  await app.listen(port);

  console.log('');
  console.log('========================================');
  console.log(`Server running on port ${port}`);
  console.log('DB connected OK');
  console.log('========================================');
  console.log('');
}
bootstrap();