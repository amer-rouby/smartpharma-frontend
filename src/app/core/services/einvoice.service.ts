import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models';
import { PharmacyContextService } from './pharmacy-context.service';
import { withHttpErrorFallback } from '../utils/http-error.util';
import { EInvoiceSubmission } from '../models/einvoice.model';

@Injectable({ providedIn: 'root' })
export class EInvoiceService {
  private readonly http = inject(HttpClient);
  private readonly pharmacy = inject(PharmacyContextService);
  private readonly apiUrl = this.pharmacy.apiUrl('e-invoice');

  getForSale(saleId: number): Observable<EInvoiceSubmission | null> {
    return this.http.get<ApiResponse<EInvoiceSubmission>>(`${this.apiUrl}/${saleId}`).pipe(
      map((response) => response.data),
      withHttpErrorFallback<EInvoiceSubmission | null>('getForSale', null)
    );
  }

  submit(saleId: number): Observable<EInvoiceSubmission | null> {
    return this.http.post<ApiResponse<EInvoiceSubmission>>(`${this.apiUrl}/${saleId}/submit`, {}).pipe(
      map((response) => response.data),
      withHttpErrorFallback<EInvoiceSubmission | null>('submit', null)
    );
  }

  /** Return receipts of a sale (partial returns). */
  getReturnsForSale(saleId: number): Observable<EInvoiceSubmission[]> {
    return this.http.get<ApiResponse<EInvoiceSubmission[]>>(`${this.apiUrl}/${saleId}/returns`).pipe(
      map((response) => response.data ?? []),
      withHttpErrorFallback<EInvoiceSubmission[]>('getReturnsForSale', [])
    );
  }

  /** Rejected or failed receipts - sales and returns, cancelled sales included. */
  getNeedingAttention(): Observable<EInvoiceSubmission[] | null> {
    return this.http.get<ApiResponse<EInvoiceSubmission[]>>(`${this.apiUrl}/attention`).pipe(
      map((response) => response.data ?? []),
      withHttpErrorFallback<EInvoiceSubmission[] | null>('getNeedingAttention', null)
    );
  }

  /** Retry (re-issue if rejected) any receipt, sale or return, by its own id. */
  retrySubmission(submissionId: number): Observable<EInvoiceSubmission | null> {
    return this.http.post<ApiResponse<EInvoiceSubmission>>(`${this.apiUrl}/submissions/${submissionId}/retry`, {}).pipe(
      map((response) => response.data),
      withHttpErrorFallback<EInvoiceSubmission | null>('retrySubmission', null)
    );
  }

  retry(saleId: number): Observable<EInvoiceSubmission | null> {
    return this.http.post<ApiResponse<EInvoiceSubmission>>(`${this.apiUrl}/${saleId}/retry`, {}).pipe(
      map((response) => response.data),
      withHttpErrorFallback<EInvoiceSubmission | null>('retry', null)
    );
  }
}
