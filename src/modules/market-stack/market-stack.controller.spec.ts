import { Test, TestingModule } from '@nestjs/testing';
import { UpdateHoldingDto } from '@App/modules/market-stack/dto/update-holding.dto';
import { IUpdateHoldingResponse } from '@App/modules/market-stack/interface/holding.interface';
import { IPortfolioResponse } from '@App/modules/market-stack/interface/portfolio.interface';
import { MarketStackController } from '@App/modules/market-stack/market-stack.controller';
import { MarketStackService } from '@App/modules/market-stack/market-stack.service';

describe('MarketStackController', () => {
  let controller: MarketStackController;
  let service: MarketStackService;

  const mockMarketStackService = {
    updateUserHolding: jest.fn(),
    getUserPortfolio: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketStackController],
      providers: [
        {
          provide: MarketStackService,
          useValue: mockMarketStackService,
        },
      ],
    }).compile();

    controller = module.get<MarketStackController>(MarketStackController);
    service = module.get<MarketStackService>(MarketStackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateHolding', () => {
    it('should call service.updateUserHolding and return response', async () => {
      const id = 'f9e6ae96-36d2-42cd-81ef-af559e6a5802';
      const userId = 'f9e6ae96-36d2-42cd-81ef-af559e6a5802';
      const dto: UpdateHoldingDto = { ticker: 'AAPL', units: 5 };
      const expectedResponse: IUpdateHoldingResponse = {
        id,
        attributes: { userId, holdings: [{ ticker: 'AAPL', units: 5 }] },
      };

      mockMarketStackService.updateUserHolding.mockResolvedValue(expectedResponse);

      const result = await controller.updateHolding(userId, dto);

      expect(service.updateUserHolding).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getUserPortfolio', () => {
    it('should call service.getUserPortfolio and return portfolio', async () => {
      const id = 'f9e6ae96-36d2-42cd-81ef-af559e6a5802';
      const userId = 'f9e6ae96-36d2-42cd-81ef-af559e6a5802';
      const expectedResponse: IPortfolioResponse = {
        id,
        attributes: {
          userId,
          asOf: new Date().toISOString(),
          holdings: [{ ticker: 'AAPL', units: 5, price: 150, market_value: 750, allocation_percent: 1 }],
        },
      };

      mockMarketStackService.getUserPortfolio.mockResolvedValue(expectedResponse);

      const result = await controller.getUserPortfolio(userId);

      expect(service.getUserPortfolio).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResponse);
    });
  });
});
