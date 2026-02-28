import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { StockBatch, StockBatchResponse, StockAdjustment } from '../models/stock.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class StockBatchService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/stock/batches`;

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  private getCommonParams(pharmacyId: number): HttpParams {
    return new HttpParams().set('pharmacyId', pharmacyId);
  }

  getBatches(pharmacyId: number, page: number = 0, size: number = 20): Observable<any> {
    const params = this.getCommonParams(pharmacyId)
      .set('page', page)
      .set('size', size);

    return this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders(), params });
  }

  getBatch(id: number): Observable<StockBatch> {
    return this.http.get<StockBatch>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createBatch(batch: Partial<StockBatch>): Observable<StockBatch> {
    return this.http.post<StockBatch>(this.apiUrl, batch, {
      headers: this.getAuthHeaders()
    });
  }

  updateBatch(id: number, batch: Partial<StockBatch>): Observable<StockBatch> {
    return this.http.put<StockBatch>(`${this.apiUrl}/${id}`, batch, {
      headers: this.getAuthHeaders()
    });
  }

  deleteBatch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getProducts(pharmacyId: number = 4): Observable<Product[]> {
    const params = new HttpParams().set('pharmacyId', pharmacyId);
    return this.http.get<Product[]>(`${environment.apiUrl}/products`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  getExpiringBatches(pharmacyId: number, days: number = 30): Observable<StockBatch[]> {
    const params = this.getCommonParams(pharmacyId).set('days', days);
    return this.http.get<StockBatch[]>(`${this.apiUrl}/expiring`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  getExpiredBatches(pharmacyId: number): Observable<StockBatch[]> {
    const params = this.getCommonParams(pharmacyId);
    return this.http.get<StockBatch[]>(`${this.apiUrl}/expired`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  adjustStock(batchId: number, adjustment: StockAdjustment): Observable<StockBatch> {
    return this.http.post<StockBatch>(`${this.apiUrl}/${batchId}/adjust`, adjustment, {
      headers: this.getAuthHeaders()
    });
  }
}
