import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models';
import { CreateMovementRequest, StockMovement, StockMovementStats } from '../models/Stock-movement.model';
import { environment } from '../../../environments/environment';

export interface StockMovementPage {
  content: StockMovement[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

const EMPTY_PAGE: StockMovementPage = {
  content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true
};

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/stock/movements`;

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getMovements(page: number = 0, size: number = 20): Observable<StockMovementPage> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<StockMovementPage>>(`${this.apiUrl}/pharmacy/${pharmacyId}`, {
      params: new HttpParams()
        .set('page', page)
        .set('size', size)
    }).pipe(
      map(response => response.data)
    );
  }

  getMovementsByBatch(batchId: number, page: number = 0, size: number = 20): Observable<StockMovementPage> {
    return this.http.get<ApiResponse<StockMovementPage>>(`${this.apiUrl}/batch/${batchId}`, {
      params: new HttpParams()
        .set('page', page)
        .set('size', size)
    }).pipe(
      map(response => response.data)
    );
  }

  getMovementsByDateRange(
    startDate: string,
    endDate: string,
    movementType?: string,
    page: number = 0,
    size: number = 20
  ): Observable<StockMovementPage> {
    const pharmacyId = this.getPharmacyId();

    let params = new HttpParams()
      .set('pharmacyId', pharmacyId)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page)
      .set('size', size);
    if (movementType && movementType !== 'all') {
      params = params.set('movementType', movementType);
    }

    return this.http.get<ApiResponse<StockMovementPage>>(`${this.apiUrl}/date-range`, { params }).pipe(
      map(response => response.data)
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
      map(response => response.data)
    );
  }

  createMovement(request: CreateMovementRequest): Observable<StockMovement> {
    return this.http.post<ApiResponse<StockMovement>>(this.apiUrl, request).pipe(
      map(response => response.data)
    );
  }
}
