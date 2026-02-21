export interface StockBatch {
  id: number;
  productId: number;
  pharmacyId: number;
  batchNumber: string;
  quantityCurrent: number;
  quantityInitial: number;
  expiryDate: string;
  buyPrice: number;
  sellPrice: number;
  location?: string;
  status: BatchStatus;
  version: number;
  createdAt: string;
}

export type BatchStatus = 'ACTIVE' | 'EXPIRED' | 'SOLD_OUT' | 'RETURNED';

export interface StockAlert {
  id: number;
  productId: number;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  alertType: 'LOW_STOCK' | 'EXPIRING_SOON' | 'EXPIRED';
  message: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: number;
  productId: number;
  batchId: number;
  adjustmentType: 'ADD' | 'REMOVE' | 'CORRECTION';
  quantity: number;
  reason: string;
  adjustedBy: number;
  adjustedAt: string;
}
