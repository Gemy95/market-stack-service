import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { Cache } from 'cache-manager';
import { MarketStackService } from '@App/modules/market-stack/market-stack.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('MarketStackService', () => {
  let service: MarketStackService;
  let httpService: jest.Mocked<HttpService>;
  let cacheManager: jest.Mocked<Cache>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    httpService = {
      get: jest.fn(),
    } as any;

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'services.marketStack.url') return 'http://fake-url';
        if (key === 'services.marketStack.apiKey') return 'fake-api-key';
        return null;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketStackService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<MarketStackService>(MarketStackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserHolding', () => {
    it('should add new holding if not exists', async () => {
      cacheManager.get.mockResolvedValue({ userId: '123', holdings: [] });

      const result = await service.updateUserHolding('123', { ticker: 'AAPL', units: 10, price: 100 });

      expect(result).toEqual({
        id: 'test-uuid',
        attributes: {
          userId: '123',
          holdings: [{ ticker: 'AAPL', units: 10, price: 100 }],
        },
      });
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should update existing holding if ticker exists', async () => {
      cacheManager.get.mockResolvedValue({
        userId: '123',
        holdings: [{ ticker: 'AAPL', units: 5, price: 90 }],
      });

      const result = await service.updateUserHolding('123', { ticker: 'AAPL', units: 10, price: 110 });

      expect(result.attributes.holdings).toEqual([{ ticker: 'AAPL', units: 10, price: 110 }]);
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });

  describe('getUserHoldingPrice', () => {
    it('should return price if holding exists', async () => {
      cacheManager.get.mockResolvedValue({
        userId: '123',
        holdings: [{ ticker: 'AAPL', units: 5, price: 120 }],
      });

      const price = await service.getUserHoldingPrice('123', 'AAPL');
      expect(price).toBe(120);
    });

    it('should return null if no holding found', async () => {
      cacheManager.get.mockResolvedValue(null);

      const price = await service.getUserHoldingPrice('123', 'TSLA');
      expect(price).toBeNull();
    });
  });

  describe('getUserPortfolio', () => {
    it('should return portfolio with cached prices', async () => {
      cacheManager.get.mockResolvedValue({
        userId: '123',
        holdings: [{ ticker: 'AAPL', units: 2, price: 100 }],
      });

      const result = await service.getUserPortfolio('123');

      expect(result.attributes.holdings[0]).toMatchObject({
        ticker: 'AAPL',
        units: 2,
        price: 100,
        market_value: 200,
      });
    });

    it('should fetch prices from API if not cached', async () => {
      cacheManager.get.mockResolvedValue({
        userId: '123',
        holdings: [{ ticker: 'TSLA', units: 2, price: null }],
      });

      httpService.get.mockReturnValueOnce(of({ data: { data: [{ symbol: 'TSLA', close: 300 }] } }) as any);

      const result = await service.getUserPortfolio('123');

      expect(result.attributes.holdings[0]).toMatchObject({
        ticker: 'TSLA',
        units: 2,
        price: 300,
        market_value: 600,
      });
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should throw error if API fails', async () => {
      cacheManager.get.mockResolvedValue({
        userId: '123',
        holdings: [{ ticker: 'TSLA', units: 2, price: null }],
      });

      httpService.get.mockImplementationOnce(() => {
        throw new Error('API error');
      });

      await expect(service.getUserPortfolio('123')).rejects.toThrow('API error');
    });
  });
});
