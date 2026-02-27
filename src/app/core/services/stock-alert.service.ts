import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models';

export interface StockAlert {
  id: number;
  productId: number;
  productName: string;
  batchNumber?: string;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING_SOON' | 'EXPIRED';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'UNREAD' | 'READ' | 'RESOLVED';
  currentStock?: number;
  minStock?: number;
  expiryDate?: string;
  daysUntilExpiry?: number;
  createdAt: string;
}

export interface AlertStats {
  totalAlerts: number;
  unreadAlerts: number;
  lowStockAlerts: number;
  expiredAlerts: number;
  expiringSoonAlerts: number;
  outOfStockAlerts: number;
}

@Injectable({
  providedIn: 'root'
})
export class StockAlertService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/alerts';

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getAlerts(): Observable<StockAlert[]> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<StockAlert[]>>(this.apiUrl, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<StockAlert[]>('getAlerts', []))
    );
  }

  getStats(): Observable<AlertStats> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<AlertStats>>(`${this.apiUrl}/stats`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<AlertStats>('getStats', {
        totalAlerts: 0,
        unreadAlerts: 0,
        lowStockAlerts: 0,
        expiredAlerts: 0,
        expiringSoonAlerts: 0,
        outOfStockAlerts: 0
      }))
    );
  }

  markAsRead(alertId: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();

    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${alertId}/read`, null, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<void>('markAsRead'))
    );
  }

  markAllAsRead(): Observable<void> {
    const pharmacyId = this.getPharmacyId();

    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/read-all`, null, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<void>('markAllAsRead'))
    );
  }

  resolveAlert(alertId: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();

    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${alertId}/resolve`, null, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<void>('resolveAlert'))
    );
  }

  deleteAlert(alertId: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();

    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${alertId}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<void>('deleteAlert'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
