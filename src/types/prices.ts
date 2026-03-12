export interface OilPrice {
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

export interface OilPricesResponse {
  brent: OilPrice;
  wti: OilPrice;
  lastUpdated: string;
}
