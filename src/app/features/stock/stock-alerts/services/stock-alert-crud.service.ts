import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CrudService, PagedResult } from '../../../../core/crud';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models';
import { AlertStats, StockAlert } from '../../../../core/models/stock-alert.model';

interface BackendPage<T> {
  content: T[];
  totalElements: number;
}

// No server-side filter/search on this endpoint - fetch one large page and
// filter/paginate client-side instead (also fixes the old size=20 cap).
@Injectable({ providedIn: 'root' })
export class StockAlertCrudService extends CrudService<StockAlert, number> {
  private static readonly FETCH_ALL_SIZE = 1000;

  override getSegmentUrl(): string {
    return `${environment.apiUrl}/alerts`;
  }

  override getAll(options?: Record<string, unknown>): Observable<PagedResult<StockAlert>> {
    const page = Number(options?.['page'] ?? 0);
    const size = Number(options?.['size'] ?? 10);
    const status = options?.['status'] as string | undefined;
    const alertType = options?.['alertType'] as string | undefined;

    const params = new HttpParams()
      .set('pharmacyId', this.getPharmacyId())
      .set('page', 0)
      .set('size', StockAlertCrudService.FETCH_ALL_SIZE);

    return this.http.get<ApiResponse<BackendPage<StockAlert>>>(this.getSegmentUrl(), { params }).pipe(
      map((res) => {
        let content = res.data.content ?? [];
        if (status && status !== 'all') {
          content = content.filter((a) => a.status.toLowerCase() === status);
        }
        if (alertType && alertType !== 'all') {
          content = content.filter((a) => a.alertType === alertType);
        }

        const start = page * size;
        const result = new PagedResult<StockAlert>();
        result.content = content.slice(start, start + size);
        result.totalElements = content.length;
        result.totalPages = Math.max(1, Math.ceil(content.length / size));
        result.size = size;
        result.number = page;
        result.first = page === 0;
        result.last = start + size >= content.length;
        return result;
      }),
    );
  }

  getStats(): Observable<AlertStats> {
    return this.http
      .get<ApiResponse<AlertStats>>(`${this.getSegmentUrl()}/stats`, {
        params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
      })
      .pipe(map((res) => res.data));
  }

  markAsRead(id: number): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.getSegmentUrl()}/${id}/read`, null, {
        params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
      })
      .pipe(map((res) => res.data));
  }

  markAllAsRead(): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.getSegmentUrl()}/read-all`, null, {
        params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
      })
      .pipe(map((res) => res.data));
  }

  resolveAlert(id: number): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.getSegmentUrl()}/${id}/resolve`, null, {
        params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
      })
      .pipe(map((res) => res.data));
  }
}
