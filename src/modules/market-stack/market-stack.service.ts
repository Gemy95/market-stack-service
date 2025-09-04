import { Inject, Injectable, Logger } from '@nestjs/common';
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { getTtlUntilEndOfDay } from '@App/shared/helper/ttl-end-of-day.helper';

@Injectable()
export class MarketStackService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get<string>('services.marketStack.url');
    this.apiKey = this.configService.get<string>('services.marketStack.apiKey');
  }

  async getLatestPrice(): Promise<ILatestPriceResponse> {
    const ticker = 'AAPL';
    const id = uuidv4();
    try {
      const cachedPrice = await this.cacheManager.get(`${ticker}_price`);
      if (cachedPrice) {
        Logger.log(`Cached Price for ticker ${ticker} equal ${cachedPrice}`);
        return {
          id,
          attributes: { price: +cachedPrice },
        };
      }
      const url = `${this.baseUrl}/eod/latest?access_key=${this.apiKey}&symbols=${ticker}`;
      const response = await firstValueFrom(this.httpService.get(url));
      const price = response.data?.data?.[0]?.close ?? null;
      await this.cacheManager.set(
        `${ticker}_price`,
        price,
        getTtlUntilEndOfDay(),
      );
      return {
        id,
        attributes: { price },
      };
    } catch (error) {
      Logger.error(`Error fetching price for ${ticker}`, error.message);
      throw error;
    }
  }

  async getUserPortfolio(userId: string): Promise<IPortfolioResponse> {
    try {
      const holdings: IHolding[] = [
        { ticker: 'AAPL', units: 1, price: null },
        { ticker: 'TSLA', units: 2, price: null },
      ];

      const priceMap: Record<string, number> = {};
      const tickersToFetch: string[] = [];

      for (const holding of holdings) {
        const cacheKey = `${holding.ticker}_price`;
        const cachedPrice = await this.cacheManager.get<number>(cacheKey);

        if (typeof cachedPrice === 'number') {
          Logger.log(`Cache hit: ${holding.ticker} = ${cachedPrice}`);
          priceMap[holding.ticker] = cachedPrice;
        } else {
          tickersToFetch.push(holding.ticker);
        }
      }

      if (tickersToFetch.length > 0) {
        try {
          const symbols = tickersToFetch.join(',');
          const url = `${this.baseUrl}/eod/latest?access_key=${this.apiKey}&symbols=${symbols}`;

          const response = await firstValueFrom(this.httpService.get(url));
          const prices: IItem[] = response?.data?.data || [];

          for (const item of prices) {
            if (typeof item.close === 'number') {
              priceMap[item.symbol] = item.close;
              await this.cacheManager.set(
                `${item.symbol}_price`,
                item.close,
                getTtlUntilEndOfDay(),
              );
              Logger.log(`Fetched from API: ${item.symbol} = ${item.close}`);
            }
          }
        } catch (apiError) {
          Logger.error('MarketStack API fetch failed', apiError.message);
          throw apiError;
        }
      }

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

      const totalMarketValue = enrichedHoldings?.reduce(
        (sum, h) => sum + (h.market_value ?? 0),
        0,
      );

      const holdingsResult = enrichedHoldings?.map((h) => ({
        ...h,
        allocation_percent:
          totalMarketValue > 0 && h.market_value
            ? h.market_value / totalMarketValue
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
      Logger.error(`Error fetching portfolio for ${userId}`, error.message);
      throw error;
    }
  }
}
