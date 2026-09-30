export type BulkPriceMode = 'PERCENT' | 'PRICE_LIST';

export interface PriceListItem {
  productId?: number;
  barcode?: string;
  sellPrice: number;
}

/** apply=false only previews the result - nothing is saved. */
export interface BulkPriceUpdateRequest {
  mode: BulkPriceMode;
  percent?: number;
  productIds?: number[];
  category?: string;
  roundTo?: number;
  items?: PriceListItem[];
  apply: boolean;
}

export interface PriceChange {
  productId: number;
  productName: string;
  barcode?: string;
  oldPrice: number;
  newPrice: number;
  /** New sell price is below the buy price. */
  belowCost: boolean;
}

export interface BulkPriceUpdateResponse {
  applied: boolean;
  changedCount: number;
  unchangedCount: number;
  changes: PriceChange[];
  /** Price-list lines that matched no product. */
  notFound: string[];
}
