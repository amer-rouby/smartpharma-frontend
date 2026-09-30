import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models';
import { PharmacyContextService } from './pharmacy-context.service';
import { withHttpErrorFallback } from '../utils/http-error.util';
import { SaleReturn, SaleReturnRequest } from '../models/sale-return.model';

// Returns of part (or all) of a sale's items.
@Injectable({ providedIn: 'root' })
export class SaleReturnService {
  private readonly http = inject(HttpClient);
  private readonly pharmacy = inject(PharmacyContextService);
  private readonly apiUrl = this.pharmacy.apiUrl('sales');

  getReturns(saleId: number): Observable<SaleReturn[]> {
    return this.http.get<ApiResponse<SaleReturn[]>>(`${this.apiUrl}/${saleId}/returns`).pipe(
      map((response) => response.data ?? []),
      withHttpErrorFallback<SaleReturn[]>('getReturns', [])
    );
  }

  // Errors are left to the caller: they carry codes like
  // SALE_RETURN_QUANTITY_EXCEEDED worth showing as they are.
  createReturn(saleId: number, request: SaleReturnRequest): Observable<SaleReturn> {
    return this.http.post<ApiResponse<SaleReturn>>(`${this.apiUrl}/${saleId}/returns`, request).pipe(
      map((response) => response.data)
    );
  }
}
