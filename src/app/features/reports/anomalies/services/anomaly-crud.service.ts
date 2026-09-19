import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CrudService, PagedResult } from '../../../../core/crud';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models';
import { Anomaly, AnomalyCounts, AnomalyPage } from '../../../../core/models/anomaly.model';

@Injectable({ providedIn: 'root' })
export class AnomalyCrudService extends CrudService<Anomaly, number> {
  override getSegmentUrl(): string {
    return `${environment.apiUrl}/anomalies`;
  }

  override getAll(options?: Record<string, unknown>): Observable<PagedResult<Anomaly>> {
    const page = Number(options?.['page'] ?? 0);
    const size = Number(options?.['size'] ?? 10);
    const status = options?.['status'] as string | undefined;
    const type = options?.['type'] as string | undefined;

    let params = new HttpParams().set('pharmacyId', this.getPharmacyId()).set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (type) params = params.set('type', type);

    return this.http.get<ApiResponse<AnomalyPage>>(this.getSegmentUrl(), { params }).pipe(
      map((res) => {
        const data = res.data;
        const result = new PagedResult<Anomaly>();
        result.content = data.content;
        result.totalElements = data.totalElements;
        result.totalPages = data.totalPages;
        result.size = data.size;
        result.number = data.number;
        return result;
      }),
    );
  }

  getCounts(): Observable<AnomalyCounts> {
    const empty: AnomalyCounts = { NEW: 0, REVIEWED: 0, DISMISSED: 0 };
    return this.http
      .get<ApiResponse<AnomalyCounts>>(`${this.getSegmentUrl()}/counts`, {
        params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
      })
      .pipe(map((res) => res.data ?? empty));
  }

  markReviewed(id: number): Observable<Anomaly> {
    return this.http.put<ApiResponse<Anomaly>>(`${this.getSegmentUrl()}/${id}/review`, {}).pipe(map((res) => res.data));
  }

  dismiss(id: number): Observable<Anomaly> {
    return this.http.put<ApiResponse<Anomaly>>(`${this.getSegmentUrl()}/${id}/dismiss`, {}).pipe(map((res) => res.data));
  }
}
