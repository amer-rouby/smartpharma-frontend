export interface SaleRequest {
  pharmacyId: number;
  items: SaleItemRequest[];
  customerPhone?: string;
  paymentMethod: string;
  discountAmount: number;
}

export interface SaleItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface SaleResponse {
  id: number;
  invoiceNumber: string;
  subtotal: number;
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string;
  customerPhone?: string;
  transactionDate: string;
  items: SaleItemResponse[];
}

export interface SaleItemResponse {
  id: number;
  productId: number;
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleSearchResult {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  transactionDate: string;
  customerPhone?: string;
  itemsCount: number;
}

export interface TodaySalesResponse {
  totalAmount: number;
  count: number;
  sales?: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}
