import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CrudService, PagedResult } from '../../../../core/crud';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models';
import { SaleResponse } from '../../../../core/models/sale.model';

interface SalesPage {
  content?: SaleResponse[];
  sales?: SaleResponse[];
  totalElements?: number;
}

// Read-only list (view/print use dedicated flows, not create/edit here).
// The backend's /sales/search endpoint has no page/size support at all -
// it returns every match in one shot - so, like UserCrudService, search
// results are paginated client-side; the plain list already paginates
// server-side and is used as-is otherwise. This also fixes a real bug: the
// old page never updated totalElements while a search was active, so
// pagination silently broke once you searched.
@Injectable({ providedIn: 'root' })
export class SaleCrudService extends CrudService<SaleResponse, number> {
  override getSegmentUrl(): string {
    return `${environment.apiUrl}/sales`;
  }

  override getAll(options?: Record<string, unknown>): Observable<PagedResult<SaleResponse>> {
    const page = Number(options?.['page'] ?? 0);
    const size = Number(options?.['size'] ?? 10);
    const search = (options?.['search'] as string | undefined)?.trim();
    const pharmacyId = this.getPharmacyId().toString();

    if (search) {
      return this.http
        .get<ApiResponse<SalesPage | SaleResponse[]>>(`${this.getSegmentUrl()}/search`, {
          params: { pharmacyId, query: search },
        })
        .pipe(
          map((res) => {
            const data = res.data;
            const all = Array.isArray(data) ? data : (data?.content ?? data?.sales ?? []);
            const start = page * size;

            const result = new PagedResult<SaleResponse>();
            result.content = all.slice(start, start + size);
            result.totalElements = all.length;
            result.totalPages = Math.max(1, Math.ceil(all.length / size));
            result.size = size;
            result.number = page;
            result.first = page === 0;
            result.last = start + size >= all.length;
            result.empty = result.content.length === 0;
            return result;
          }),
        );
    }

    return this.http
      .get<ApiResponse<SalesPage>>(this.getSegmentUrl(), { params: { pharmacyId, page: page.toString(), size: size.toString() } })
      .pipe(
        map((res) => {
          const data = res.data;
          const content = data?.content ?? data?.sales ?? [];

          const result = new PagedResult<SaleResponse>();
          result.content = content;
          result.totalElements = data?.totalElements ?? content.length;
          result.size = size;
          result.number = page;
          return result;
        }),
      );
  }
}
