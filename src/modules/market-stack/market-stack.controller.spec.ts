import { MarketStackController } from '@App/modules/market-stack/market-stack.controller';
import { Test, TestingModule } from '@nestjs/testing';

describe('MarketStackController', () => {
  let controller: MarketStackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketStackController],
    }).compile();

    controller = module.get<MarketStackController>(MarketStackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
