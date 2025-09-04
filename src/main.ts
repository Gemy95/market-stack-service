import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';
import { AppModule } from '@App/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get('app.port') ?? process.env.SERVER_PORT);
  await app.listen(port, () => {
    Logger.log(`service is running on port ${port}`);
  });
}
bootstrap();
