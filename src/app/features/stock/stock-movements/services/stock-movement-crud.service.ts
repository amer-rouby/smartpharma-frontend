import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CrudService, PagedResult } from '../../../../core/crud';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models';
import { StockMovement } from '../../../../core/models/Stock-movement.model';
import { StockMovementPage } from '../../../../core/services/stock-movement.service';

// Read-only list. The backend has two endpoints for the same data - a plain
// pharmacy-wide page, and a date-range page (with an optional movementType
// filter) - so getAll() picks between them based on whether the caller's
// options carry a startDate/endDate (folded in by the component's
// buildLoadOptions override), instead of exposing that branching to the page.
@Injectable({ providedIn: 'root' })
export class StockMovementCrudService extends CrudService<StockMovement, number> {
  override getSegmentUrl(): string {
    return `${environment.apiUrl}/stock/movements`;
  }

  override getAll(options?: Record<string, unknown>): Observable<PagedResult<StockMovement>> {
    const page = Number(options?.['page'] ?? 0);
    const size = Number(options?.['size'] ?? 10);
    const startDate = options?.['startDate'] as string | undefined;
    const endDate = options?.['endDate'] as string | undefined;
    const movementType = options?.['movementType'] as string | undefined;

    let params = new HttpParams().set('page', page).set('size', size);
    let url: string;

    if (startDate && endDate) {
      url = `${this.getSegmentUrl()}/date-range`;
      params = params.set('pharmacyId', this.getPharmacyId()).set('startDate', startDate).set('endDate', endDate);
      if (movementType && movementType !== 'all') {
        params = params.set('movementType', movementType);
      }
    } else {
      url = `${this.getSegmentUrl()}/pharmacy/${this.getPharmacyId()}`;
    }

    return this.http.get<ApiResponse<StockMovementPage>>(url, { params }).pipe(
      map((res) => {
        const data = res.data;
        const result = new PagedResult<StockMovement>();
        result.content = data.content;
        result.totalElements = data.totalElements;
        result.totalPages = data.totalPages;
        result.size = data.size;
        result.number = data.number;
        result.first = data.first;
        result.last = data.last;
        return result;
      }),
    );
  }
}
