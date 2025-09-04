import { MarketStackService } from '@App/modules/market-stack/market-stack.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('MarketStackService', () => {
  let service: MarketStackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketStackService],
    }).compile();

    service = module.get<MarketStackService>(MarketStackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
