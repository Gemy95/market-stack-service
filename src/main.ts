import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@App/app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = Number(configService.get('app.port') ?? process.env.SERVER_PORT);

  app.enableCors();
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('/api');

  await app.listen(port, () => {
    Logger.log(`service is running on port ${port}`);
  });
}
bootstrap();
