export interface SaleTransaction {
  id: number;
  pharmacyId: number;
  userId: number;
  invoiceNumber: string;
  totalAmount: number;
  discountAmount: number;
  paymentMethod: PaymentMethod;
  customerPhone?: string;
  transactionDate: string;
  items: SaleItem[];
}

export type PaymentMethod = 'CASH' | 'VISA' | 'INSTAPAY' | 'WALLET' | 'CREDIT';

export interface SaleItem {
  id: number;
  transactionId: number;
  productId: number;
  productName?: string;
  batchId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleRequest {
  items: SaleItemRequest[];
  discountAmount?: number;
  paymentMethod?: string;
  customerPhone?: string;
}

export interface SaleItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface DailySales {
  date: string;
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  topProducts: ProductSale[];
}

export interface ProductSale {
  productId: number;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}
