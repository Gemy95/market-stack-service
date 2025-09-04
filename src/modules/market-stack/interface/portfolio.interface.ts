import { IHolding } from '@App/modules/market-stack/interface/holding.interface';

export interface IPortfolioResponse {
  id: string;
  attributes: {
    userId: string;
    asOf: string;
    holdings: IHolding[];
  };
}
