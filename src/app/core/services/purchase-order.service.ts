import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiResponse, PaginatedResponse } from '../models';
import {
  PurchaseOrder,
  PurchaseOrderStats,
  Supplier
} from '../models/purchase-order.model';
import { PurchaseOrderRequest } from '../models/purchase-request.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/purchase-orders';

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getOrders(page: number = 0, size: number = 10): Observable<PaginatedResponse<PurchaseOrder>> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<PaginatedResponse<PurchaseOrder>>>(this.apiUrl, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('page', page)
        .set('size', size)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PaginatedResponse<PurchaseOrder>>('getOrders'))
    );
  }

  getOrdersByStatus(status: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<PurchaseOrder>> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<PaginatedResponse<PurchaseOrder>>>(
      `${this.apiUrl}/status/${status}`, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('page', page)
        .set('size', size)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PaginatedResponse<PurchaseOrder>>('getOrdersByStatus'))
    );
  }

  getOrder(id: number): Observable<PurchaseOrder> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<PurchaseOrder>>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PurchaseOrder>('getOrder'))
    );
  }

  createOrder(request: PurchaseOrderRequest): Observable<PurchaseOrder> {
    const pharmacyId = this.getPharmacyId();
    return this.http.post<ApiResponse<PurchaseOrder>>(this.apiUrl, request, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PurchaseOrder>('createOrder'))
    );
  }

  updateOrder(id: number, request: PurchaseOrderRequest): Observable<PurchaseOrder> {
    const pharmacyId = this.getPharmacyId();
    return this.http.put<ApiResponse<PurchaseOrder>>(`${this.apiUrl}/${id}`, request, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PurchaseOrder>('updateOrder'))
    );
  }

  deleteOrder(id: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<void>('deleteOrder'))
    );
  }

  approveOrder(id: number): Observable<PurchaseOrder> {
    const pharmacyId = this.getPharmacyId();
    return this.http.post<ApiResponse<PurchaseOrder>>(`${this.apiUrl}/${id}/approve`, null, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PurchaseOrder>('approveOrder'))
    );
  }

  cancelOrder(id: number): Observable<PurchaseOrder> {
    const pharmacyId = this.getPharmacyId();
    return this.http.post<ApiResponse<PurchaseOrder>>(`${this.apiUrl}/${id}/cancel`, null, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PurchaseOrder>('cancelOrder'))
    );
  }

  receiveOrder(id: number): Observable<PurchaseOrder> {
    const pharmacyId = this.getPharmacyId();
    return this.http.post<ApiResponse<PurchaseOrder>>(`${this.apiUrl}/${id}/receive`, null, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PurchaseOrder>('receiveOrder'))
    );
  }

  getStats(): Observable<PurchaseOrderStats> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<PurchaseOrderStats>>(`${this.apiUrl}/count`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PurchaseOrderStats>('getStats'))
    );
  }

  createFromPrediction(predictionId: number): Observable<PurchaseOrder> {
    const pharmacyId = this.getPharmacyId();
    return this.http.post<ApiResponse<PurchaseOrder>>(
      `${this.apiUrl}/from-prediction/${predictionId}`, null, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PurchaseOrder>('createFromPrediction'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
