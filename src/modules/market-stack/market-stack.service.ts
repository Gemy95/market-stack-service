import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  IHolding,
  IItem,
} from '@App/modules/market-stack/interface/holding.interface';
import { v4 as uuidv4 } from 'uuid';
import { IPortfolioResponse } from '@App/modules/market-stack/interface/portfolio.interface';
import { ILatestPriceResponse } from '@App/modules/market-stack/interface/latest-price.interface';

@Injectable()
export class MarketStackService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('services.marketStack.url');
    this.apiKey = this.configService.get<string>('services.marketStack.apiKey');
  }

  async getLatestPrice(): Promise<ILatestPriceResponse> {
    const ticker = 'AAPL';
    try {
      const url = `${this.baseUrl}/eod/latest?access_key=${this.apiKey}&symbols=${ticker}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return {
        id: uuidv4(),
        attributes: { price: response.data?.data?.[0]?.close ?? null },
      };
    } catch (error) {
      Logger.error(`Error fetching price for ${ticker}`, error.message);
      throw error;
    }
  }

  async getUserPortfolio(userId: string): Promise<IPortfolioResponse> {
    try {
      const holdings: IHolding[] = [
        { ticker: 'AAPL', units: 1 },
        { ticker: 'TSLA', units: 2 },
      ];

      const symbols = holdings?.map((holding) => holding.ticker).join(',');
      const url = `${this.baseUrl}/eod/latest?access_key=${this.apiKey}&symbols=${symbols}`;

      const response = await firstValueFrom(this.httpService.get(url));
      const prices = response?.data?.data || [];

      const priceMap: Record<string, number> = {};
      prices.forEach((item: IItem) => {
        priceMap[item.symbol] = item.close;
      });

      const enrichedHoldings = holdings.map((holding) => {
        const price = priceMap[holding.ticker] ?? null;
        const marketValue = price ? holding.units * price : null;
        return {
          ticker: holding.ticker,
          units: holding.units,
          price,
          market_value: marketValue,
        };
      });

      const totalMarketValue = enrichedHoldings.reduce(
        (sum, h) => sum + (h.market_value || 0),
        0,
      );

      const holdingsResult = enrichedHoldings.map((holding) => ({
        ...holding,
        allocation_percent:
          totalMarketValue > 0 && holding.market_value
            ? holding.market_value / totalMarketValue
            : 0,
      }));

      return {
        id: uuidv4(),
        attributes: {
          userId,
          asOf: new Date().toISOString(),
          holdings: holdingsResult,
        },
      };
    } catch (error) {
      Logger.error(
        `Error fetching user portfolio for ${userId}`,
        error.message,
      );
      throw error;
    }
  }
}
