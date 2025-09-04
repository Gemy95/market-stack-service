import { MarketStackService } from '@App/modules/market-stack/market-stack.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller({ path: '/market-stack', version: ['1'] })
export class MarketStackController {
  constructor(private readonly marketStackService: MarketStackService) {}

  @Get('/price')
  async getLatestPrice() {
    return this.marketStackService.getLatestPrice();
  }

  @Get('/portfolio/:userId')
  async getUserPortfolio(@Param('userId') userId: string) {
    return this.marketStackService.getUserPortfolio(userId);
  }
}
