import { AppModule } from '@App/app.module';
import { Environment } from '@App/config/env.validation';
import { CatchEverythingFilter } from '@App/shared/filter/all-exception.filter';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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
    })
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('/api');

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CatchEverythingFilter(httpAdapterHost));

  if (configService.get('app.env') !== Environment.PRODUCTION) {
    const config = new DocumentBuilder().setTitle('Market Stack Apis').setVersion('1.0').addTag('Market Stack').build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
  }

  await app.listen(port, () => {
    Logger.log(`server is running on port ${port}`);
  });
}
bootstrap();
