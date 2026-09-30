export interface SaleReturnRequest {
  items: { saleItemId: number; quantity: number }[];
  reason?: string;
  /** False for damaged/expired goods that shouldn't go back on the shelf. */
  restock: boolean;
}

export interface SaleReturnItem {
  saleItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleReturn {
  id: number;
  saleId: number;
  /** 1, 2, ... within the sale. */
  returnNumber: number;
  itemsTotal: number;
  /** The returned items' share of the sale's discount. */
  discountShare: number;
  /** What the customer got back: itemsTotal - discountShare. */
  refundAmount: number;
  restocked: boolean;
  reason?: string;
  createdAt: string;
  items: SaleReturnItem[];
}
