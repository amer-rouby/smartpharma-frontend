import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models';
import { AlertStats, StockAlert } from '../models/stock-alert.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class StockAlertService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/alerts`;

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getAlerts(): Observable<StockAlert[]> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<StockAlert[]>>(this.apiUrl, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data)
    );
  }

  getStats(): Observable<AlertStats> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<AlertStats>>(`${this.apiUrl}/stats`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data)
    );
  }

  markAsRead(alertId: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();

    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${alertId}/read`, null, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data)
    );
  }

  markAllAsRead(): Observable<void> {
    const pharmacyId = this.getPharmacyId();

    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/read-all`, null, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data)
    );
  }

  resolveAlert(alertId: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();

    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${alertId}/resolve`, null, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data)
    );
  }

  deleteAlert(alertId: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();

    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${alertId}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data)
    );
  }
}
