import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface SalesReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: number;
  totalItems: number;
  revenueByPaymentMethod: Record<string, number>;
  topProducts: Array<{
    productId: number;
    productName: string;
    quantitySold: number;
    totalRevenue: number;
  }>;
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface FinancialReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
  }>;
}

export interface StockReportData {
  totalStockValue: number;
  totalItems: number;
  lowStockItems: number;
  expiredItems: number;
  expiringSoonItems: number;
  stockByCategory: Array<{
    categoryName: string;
    itemCount: number;
    totalValue: number;
  }>;
  lowStockProducts: Array<{
    productId: number;
    productName: string;
    batchNumber: string;
    currentStock: number;
    minStock: number;
    expiryDate?: string;
  }>;
  expiringProducts: Array<{
    productId: number;
    productName: string;
    batchNumber: string;
    currentStock: number;
    expiryDate: string;
    daysUntilExpiry: number;
  }>;
}

export interface ExpiryReportData {
  totalExpiring: number;
  urgentExpiring: number;
  warningExpiring: number;
  okExpiring: number;
  expiringProducts: Array<{
    productId: number;
    productName: string;
    batchNumber: string;
    expiryDate: string;
    daysUntilExpiry: number;
    currentStock: number;
    status: 'URGENT' | 'WARNING' | 'OK';
    estimatedValue: number;
  }>;
}

export interface ReportRequest {
  pharmacyId: number;
  startDate?: string;
  endDate?: string;
  reportType?: 'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/reports';

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getSalesReport(request: ReportRequest): Observable<SalesReportData> {
    return this.http.post<any>(`${this.baseUrl}/sales`, request).pipe(
      map(response => response.data)
    );
  }

  getFinancialReport(request: ReportRequest): Observable<FinancialReportData> {
    return this.http.post<any>(`${this.baseUrl}/financial`, request).pipe(
      map(response => response.data)
    );
  }

  getStockReport(request: ReportRequest): Observable<StockReportData> {
    return this.http.post<any>(`${this.baseUrl}/stock`, request).pipe(
      map(response => response.data)
    );
  }

  getExpiryReport(request: ReportRequest): Observable<ExpiryReportData> {
    return this.http.post<any>(`${this.baseUrl}/expiry`, request).pipe(
      map(response => response.data)
    );
  }
}
