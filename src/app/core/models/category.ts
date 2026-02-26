export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  pharmacyId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  pharmacyId: number;
  isActive?: boolean;
}

export interface CategoriesCountResponse {
  count: number;
}
