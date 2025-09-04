import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '@App/config/configuration';
import { validate } from '@App/config/env.validation';
import { AppController } from '@App/app.controller';
import { AppService } from '@App/app.service';
import { MarketStackModule } from '@App/modules/market-stack/market-stack.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    MarketStackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
