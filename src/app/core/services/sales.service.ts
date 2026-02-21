import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { SaleRequest } from '../models';
import { SaleResponse, SaleSearchResult } from '../models/sale.model';

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

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api';

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getTodaySalesSummary(): Observable<TodaySalesResponse> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<TodaySalesResponse>>(`${this.baseUrl}/sales/today/summary`, {
      params: { pharmacyId: pharmacyId.toString() }
    }).pipe(
      map(response => response.data || { totalAmount: 0, count: 0 }),
      catchError(() => throwError(() => new Error('Failed to load sales summary')))
    );
  }

  getTodaySales(): Observable<TodaySalesResponse> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<TodaySalesResponse>>(`${this.baseUrl}/sales/today`, {
      params: { pharmacyId: pharmacyId.toString() }
    }).pipe(
      map(response => response.data || { totalAmount: 0, count: 0 }),
      catchError(() => throwError(() => new Error('Failed to load today sales')))
    );
  }

  getSalesStats(): Observable<any> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/sales/stats`, {
      params: { pharmacyId: pharmacyId.toString() }
    }).pipe(
      map(response => response.data || {}),
      catchError(() => throwError(() => new Error('Failed to load sales stats')))
    );
  }

  // ✅ ✅ ✅ getAllSales مع 3 parameters ✅ ✅ ✅
  getAllSales(pharmacyId: number, page: number, size: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/sales`, {
      params: {
        pharmacyId: pharmacyId.toString(),
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      map(response => response.data || response),
      catchError(() => throwError(() => new Error('Failed to load sales')))
    );
  }

  getSaleById(id: number): Observable<any> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/sales/${id}`, {
      params: { pharmacyId: pharmacyId.toString() }
    }).pipe(
      map(response => response.data),
      catchError(() => throwError(() => new Error('Failed to load sale')))
    );
  }

  // ✅ حدّث الـ methods دي في SalesService:

  // ✅ createSale - استخدام SaleRequest DTO
  createSale(request: SaleRequest): Observable<SaleResponse> {

    const pharmacyId = this.getPharmacyId();

    return this.http.post<ApiResponse<SaleResponse>>(
      `${this.baseUrl}/sales?pharmacyId=${pharmacyId}`, // ✅ query param
      {
        ...request,
        pharmacyId: pharmacyId   // ✅ كمان في البادي
      }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Create Sale Error:', error);
        return throwError(() =>
          new Error(error?.error?.message || 'Failed to create sale')
        );
      })
    );
  }

  // ✅ getRecentSales - method جديدة
  getRecentSales(limit: number = 10): Observable<SaleSearchResult[]> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<SaleSearchResult[]>>(
      `${this.baseUrl}/recent?pharmacyId=${pharmacyId}&limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${this.authService.getToken()}` } }
    ).pipe(
      map(response => response.data),
      catchError(() => throwError(() => new Error('Failed to load recent sales')))
    );
  }

  deleteSale(id: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();
    return this.http.delete<void>(`${this.baseUrl}/sales/${id}`, {
      params: { pharmacyId: pharmacyId.toString() }
    }).pipe(
      catchError(() => throwError(() => new Error('Failed to delete sale')))
    );
  }

  // ✅ ✅ ✅ searchSales: pharmacyId = number, query = string ✅ ✅ ✅
  searchSales(pharmacyId: number, query: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/sales/search`, {
      params: {
        pharmacyId: pharmacyId.toString(),
        query: query
      }
    }).pipe(
      map(response => response.data || response),
      catchError(() => throwError(() => new Error('Failed to search sales')))
    );
  }

  getSalesByDateRange(startDate: string, endDate: string): Observable<any> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/sales/range`, {
      params: {
        pharmacyId: pharmacyId.toString(),
        startDate: startDate,
        endDate: endDate
      }
    }).pipe(
      map(response => response.data),
      catchError(() => throwError(() => new Error('Failed to load sales by date range')))
    );
  }
}
