import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../../core/models';
import { environment } from '../../../../environments/environment';
import { BulkPriceUpdateRequest, BulkPriceUpdateResponse } from '../models/bulk-price.model';

// Bulk repricing. Kept out of ProductCrudService, whose responses are cast
// to ProductModel. Errors reach the caller so the dialog can show them.
@Injectable({ providedIn: 'root' })
export class ProductPricingService {
  private readonly http = inject(HttpClient);

  updatePrices(request: BulkPriceUpdateRequest): Observable<BulkPriceUpdateResponse> {
    return this.http
      .post<ApiResponse<BulkPriceUpdateResponse>>(`${environment.apiUrl}/products/bulk-price`, request)
      .pipe(map((response) => response.data));
  }
}
