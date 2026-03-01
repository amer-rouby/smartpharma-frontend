import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models';

export interface DemandPrediction {
  predictionId: number;
  productId: number;
  productName: string;
  productCode?: string;
  pharmacyId: number;
  predictionDate: string;
  predictedQuantity: number;
  currentStock: number;
  recommendedOrder: number;
  confidenceLevel: number;
  algorithmVersion: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalityFactor: 'high' | 'medium' | 'low';
  recommendation: string;
  createdAt: string;
}

export interface PredictionStats {
  averageAccuracy: number;
  totalPredictions: number;
  lastUpdated: string;
}

export interface PredictionsResponse {
  content: DemandPrediction[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class DemandPredictionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/predictions';

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getPredictions(page: number = 0, size: number = 10): Observable<DemandPrediction[]> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<PredictionsResponse>>(this.apiUrl, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('page', page)
        .set('size', size)
    }).pipe(
      map(response => response.data?.content || []),
      catchError(this.handleError<DemandPrediction[]>('getPredictions', []))
    );
  }

  getPredictionsWithPagination(page: number = 0, size: number = 10): Observable<PredictionsResponse> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<PredictionsResponse>>(this.apiUrl, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('page', page)
        .set('size', size)
    }).pipe(
      map(response => response.data || { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10, first: true, last: true }),
      catchError(this.handleError<PredictionsResponse>('getPredictionsWithPagination', { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10, first: true, last: true }))
    );
  }

  getUpcomingPredictions(daysAhead: number = 7): Observable<DemandPrediction[]> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<DemandPrediction[]>>(`${this.apiUrl}/upcoming`, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('daysAhead', daysAhead)
    }).pipe(
      map(response => response.data || []),
      catchError(this.handleError<DemandPrediction[]>('getUpcomingPredictions', []))
    );
  }

  generatePredictions(forDate?: string): Observable<void> {
    const pharmacyId = this.getPharmacyId();
    let params = new HttpParams().set('pharmacyId', pharmacyId);
    if (forDate) params = params.set('forDate', forDate);
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/generate`, null, { params }).pipe(
      map(response => response.data),
      catchError(this.handleError<void>('generatePredictions'))
    );
  }

  getAccuracyStats(): Observable<PredictionStats> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<PredictionStats>>(`${this.apiUrl}/accuracy`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data || { averageAccuracy: 0, totalPredictions: 0, lastUpdated: new Date().toISOString() }),
      catchError(this.handleError<PredictionStats>('getAccuracyStats', { averageAccuracy: 0, totalPredictions: 0, lastUpdated: new Date().toISOString() }))
    );
  }

  createPurchaseFromPrediction(predictionId: number): Observable<any> {
    const pharmacyId = this.getPharmacyId();
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${predictionId}/create-purchase`, { pharmacyId }).pipe(
      map(response => response.data),
      catchError(this.handleError<any>('createPurchaseFromPrediction'))
    );
  }

  getPredictionDetails(predictionId: number): Observable<DemandPrediction> {
    return this.http.get<ApiResponse<DemandPrediction>>(`${this.apiUrl}/${predictionId}`).pipe(
      map(response => response.data),
      catchError(this.handleError<DemandPrediction>('getPredictionDetails'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
