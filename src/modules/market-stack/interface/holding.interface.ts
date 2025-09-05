export interface IHolding {
  ticker: string;
  units?: number;
  price?: number | null;
  market_value?: number | null;
  allocation_percent?: number;
}

export interface IItem {
  symbol: string;
  close: number;
}

export interface IUpdateHoldingResponse {
  id: string;
  attributes: {
    userId: string;
    holdings: IHolding[];
  };
}
