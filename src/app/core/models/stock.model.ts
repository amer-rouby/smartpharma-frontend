// src/app/core/models/stock.model.ts

export interface StockBatch {
  id: number;
  productId: number;
  productName?: string;  // ✅ أضف ده عشان العرض في الـ table
  batchNumber: string;
  quantityCurrent: number;
  quantityInitial: number;
  expiryDate: string;
  productionDate?: string;
  location?: string;
  shelf?: string;
  warehouse?: string;
  notes?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DISCARDED' | 'GOOD' | 'LOW' | 'EXPIRING_SOON';
  createdAt?: string;
  updatedAt?: string;
  // ✅ أضف الـ properties دي عشان تتطابق مع الـ Backend response
  pharmacyId?: number;
  buyPrice?: number;
  sellPrice?: number;
  version?: number;
}

export interface StockBatchResponse {
  content: StockBatch[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  pageSize: number;
}

export interface StockAdjustment {
  batchId: number;
  quantity: number;
  reason: string;
  reference?: string;
}
