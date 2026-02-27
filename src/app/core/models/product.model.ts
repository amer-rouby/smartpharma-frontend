export interface Product {
  id: number;
  pharmacyId: number;
  name: string;
  scientificName?: string;
  barcode?: string;
  category?: string;
  unitType: string;
  minStockLevel: number;
  prescriptionRequired: boolean;
  totalStock: number;
  sellPrice: number;
  buyPrice?: number;
  extraAttributes?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  scientificName?: string;
  barcode?: string;
  category?: string;
  unitType?: string;
  minStockLevel?: number;
  prescriptionRequired?: boolean;
  sellPrice: number;
  buyPrice?: number;
  extraAttributes?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ProductsCountResponse {
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}
