// src/app/core/services/dashboard.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

// ✅ ✅ ✅ DashboardStats Interface - كامل ✅ ✅ ✅
export interface DashboardStats {
  // ✅ إحصائيات المبيعات اليوم
  todayRevenue: number;
  todayOrders: number;
  todayAverageOrder: number;

  // ✅ إحصائيات المخزون
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inventoryValue: number;

  // ✅ إحصائيات التنبيهات
  expiringBatches: number;
  expiredBatches: number;

  // ✅ Top Products
  topProducts: TopProduct[];

  // ✅ Recent Sales
  recentSales: RecentSale[];
}

// ✅ TopProduct Interface
export interface TopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

// ✅ RecentSale Interface
export interface RecentSale {
  saleId: number;
  invoiceNumber: string;
  totalAmount: number;
  transactionDate: string;
  paymentMethod: string;
}

// ✅ ApiResponse Generic Interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/dashboard';

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  getDashboardStats(): Observable<DashboardStats> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<DashboardStats>>(
      `${this.baseUrl}/stats?pharmacyId=${pharmacyId}`,
      this.getAuthHeaders()
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        return throwError(() => new Error('Failed to load dashboard stats'));
      })
    );
  }
}
