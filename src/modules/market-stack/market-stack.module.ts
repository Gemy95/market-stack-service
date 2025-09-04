import { MarketStackController } from '@App/modules/market-stack/market-stack.controller';
import { MarketStackService } from '@App/modules/market-stack/market-stack.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  controllers: [MarketStackController],
  providers: [MarketStackService],
})
export class MarketStackModule {}
