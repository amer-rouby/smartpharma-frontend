import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models';

export interface StockMovement {
  id: number;
  batchId: number;
  productName: string;
  batchNumber: string;
  movementType: 'STOCK_IN' | 'STOCK_OUT' | 'STOCK_ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'EXPIRED' | 'DISCARDED';
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  unitPrice?: number;
  totalValue?: number;
  referenceNumber?: string;
  reason?: string;
  notes?: string;
  movementDate: string;
  userId: number;
  userName: string;
  pharmacyId: number;
}

export interface StockMovementStats {
  totalMovements: number;
  totalStockIn: number;
  totalStockOut: number;
  totalAdjustments: number;
  totalExpired: number;
  totalTransferred: number;
}

export interface CreateMovementRequest {
  batchId: number;
  movementType: string;
  quantity: number;
  unitPrice?: number;
  referenceNumber?: string;
  reason?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/stock/movements';

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getMovements(page: number = 0, size: number = 20): Observable<StockMovement[]> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<StockMovement[]>>(`${this.apiUrl}/pharmacy/${pharmacyId}`, {
      params: new HttpParams()
        .set('page', page)
        .set('size', size)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<StockMovement[]>('getMovements', []))
    );
  }

  getMovementsByBatch(batchId: number, page: number = 0, size: number = 20): Observable<StockMovement[]> {
    return this.http.get<ApiResponse<StockMovement[]>>(`${this.apiUrl}/batch/${batchId}`, {
      params: new HttpParams()
        .set('page', page)
        .set('size', size)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<StockMovement[]>('getMovementsByBatch', []))
    );
  }

  getMovementsByDateRange(
    startDate: string,
    endDate: string,
    page: number = 0,
    size: number = 20
  ): Observable<StockMovement[]> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<StockMovement[]>>(`${this.apiUrl}/date-range`, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('startDate', startDate)
        .set('endDate', endDate)
        .set('page', page)
        .set('size', size)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<StockMovement[]>('getMovementsByDateRange', []))
    );
  }

  getStats(startDate: string, endDate: string): Observable<StockMovementStats> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<StockMovementStats>>(`${this.apiUrl}/stats`, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('startDate', startDate)
        .set('endDate', endDate)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<StockMovementStats>('getStats', {
        totalMovements: 0,
        totalStockIn: 0,
        totalStockOut: 0,
        totalAdjustments: 0,
        totalExpired: 0,
        totalTransferred: 0
      }))
    );
  }

  createMovement(request: CreateMovementRequest): Observable<StockMovement> {
    return this.http.post<ApiResponse<StockMovement>>(this.apiUrl, request).pipe(
      map(response => response.data),
      catchError(this.handleError<StockMovement>('createMovement'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
