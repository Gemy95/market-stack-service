import { UpdateHoldingDto } from '@App/modules/market-stack/dto/update-holding.dto';
import { IHolding, IItem, IUpdateHoldingResponse } from '@App/modules/market-stack/interface/holding.interface';
import { IPortfolioResponse } from '@App/modules/market-stack/interface/portfolio.interface';
import { getTtlUntilEndOfDay } from '@App/shared/helper/ttl-end-of-day.helper';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MarketStackService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    this.baseUrl = this.configService.get<string>('services.marketStack.url');
    this.apiKey = this.configService.get<string>('services.marketStack.apiKey');
  }

  async updateUserHolding(userId: string, body: UpdateHoldingDto): Promise<IUpdateHoldingResponse> {
    const user = await this.cacheManager.get<{ userId: string; holdings: IHolding[] }>(`user:${userId}`);

    let holdings: IHolding[] = user?.['holdings'] || [];

    if (Array.isArray(holdings) && holdings?.length) {
      const existsHolding = holdings.find((holding) => holding.ticker === body.ticker);

      if (!existsHolding) {
        holdings = [...holdings, { ...body }];
      } else {
        holdings = holdings?.map((holding) => (holding.ticker === body.ticker ? { ...holding, ...body } : holding));
      }
    } else {
      holdings = [{ ...body }];
    }

    await this.cacheManager.set(`user:${userId}`, { userId, holdings }, getTtlUntilEndOfDay());

    return {
      id: uuidv4(),
      attributes: {
        userId,
        holdings,
      },
    };
  }

  async getUserHoldingPrice(userId: string, ticker: string): Promise<number | null> {
    const user = await this.cacheManager.get<{
      userId: string;
      holdings: { ticker: string; units: number; price: number | null }[];
    }>(`user:${userId}`);

    if (!user || !Array.isArray(user.holdings)) {
      return null;
    }

    const holding = user?.holdings.find((h) => h.ticker === ticker);
    return holding ? holding?.price : null;
  }

  async getUserPortfolio(userId: string): Promise<IPortfolioResponse> {
    try {
      const user = await this.cacheManager.get<{ userId: string; holdings: IHolding[] }>(`user:${userId}`);
      const holdings: IHolding[] = user?.['holdings'] || [];

      const priceMap: Record<string, number> = {};
      const tickersToFetch: string[] = [];

      for (const holding of holdings) {
        const cachedPrice = await this.getUserHoldingPrice(userId, holding.ticker);

        if (typeof cachedPrice === 'number') {
          Logger.log(`Cache hit: ${holding.ticker} = ${cachedPrice}`);
          priceMap[holding.ticker] = cachedPrice;
        } else {
          tickersToFetch.push(holding.ticker);
        }
      }

      if (tickersToFetch?.length) {
        try {
          const symbols = tickersToFetch.join(',');
          const url = `${this.baseUrl}/eod/latest?access_key=${this.apiKey}&symbols=${symbols}`;

          const response = await firstValueFrom(this.httpService.get(url));
          const prices: IItem[] = response?.data?.data || [];

          for (const item of prices) {
            if (typeof item.close === 'number') {
              priceMap[item.symbol] = item.close;
              await this.updateUserHolding(userId, {
                ticker: item.symbol,
                price: item.close,
              });
              Logger.log(`Fetched from API: ${item.symbol} = ${item.close}`);
            }
          }
        } catch (apiError) {
          Logger.error('MarketStack API fetch failed', apiError.message);
          throw apiError;
        }
      }

      const enrichedHoldings = holdings?.map((holding) => {
        const price = priceMap[holding.ticker] ?? null;
        const marketValue = price ? holding.units * price : null;

        return {
          ticker: holding.ticker,
          units: holding.units,
          price,
          market_value: marketValue,
        };
      });

      const totalMarketValue = enrichedHoldings?.reduce((sum, h) => sum + (h.market_value ?? 0), 0);

      const holdingsResult = enrichedHoldings?.map((h) => ({
        ...h,
        allocation_percent: totalMarketValue > 0 && h.market_value ? h.market_value / totalMarketValue : 0,
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
