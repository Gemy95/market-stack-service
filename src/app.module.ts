import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration } from '@App/config/configuration';
import { validate } from '@App/config/env.validation';
import { AppController } from '@App/app.controller';
import { AppService } from '@App/app.service';
import { MarketStackModule } from '@App/modules/market-stack/market-stack.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        stores: [
          new Keyv({
            store: new CacheableMemory(),
          }),
          createKeyv(
            `redis://${configService.get<string>('REDIS_USERNAME')}:${configService.get<string>('REDIS_PASSWORD')}@${configService.get<string>('REDIS_HOST')}:${configService.get<number>('REDIS_PORT')}`,
          ),
        ],
      }),
    }),
    MarketStackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
