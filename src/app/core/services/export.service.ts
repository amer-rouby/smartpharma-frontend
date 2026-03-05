import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface ExportOptions {
  fileName: string;
  fileType: 'pdf' | 'excel';
  endpoint: string;
  params?: Record<string, any>;
  preview?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly baseUrl = `${environment.apiUrl}/reports/export`;

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/octet-stream'
    });
  }

  exportReport(options: ExportOptions): Observable<Blob> {
    let params = new HttpParams();
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}${options.endpoint}`;
    const headers = this.getAuthHeaders();

    return this.http.get(url, { headers, params, responseType: 'blob' }).pipe(
      tap(blob => {
        if (options.preview) {
          this.openBlobInNewTab(blob, options.fileType);
          this.snackBar.open(`تم فتح ${options.fileType.toUpperCase()} في نافذة جديدة`, 'إغلاق', { duration: 3000 });
        } else if (!options.onSuccess) {
          this.downloadBlob(blob, options.fileName);
          this.snackBar.open(`تم تحميل ${options.fileType.toUpperCase()} بنجاح`, 'إغلاق', { duration: 3000 });
        }
        if (options.onSuccess) options.onSuccess();
      }),
      catchError(error => {
        const msg = options.onError ? null : `فشل تحميل ملف ${options.fileType.toUpperCase()}`;
        if (msg) this.snackBar.open(msg, 'إغلاق', { duration: 3000 });
        if (options.onError) options.onError(error);
        return throwError(() => error);
      })
    );
  }

  private openBlobInNewTab(blob: Blob, fileType: 'pdf' | 'excel'): void {
    const blobUrl = window.URL.createObjectURL(blob);
    const newTab = window.open(blobUrl, '_blank');
    if (!newTab) {
      this.snackBar.open('يرجى السماح بالنوافذ المنبثقة', 'إغلاق', { duration: 5000 });
      window.URL.revokeObjectURL(blobUrl);
      return;
    }
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 300000);
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // === طرق مختصرة للتصدير ===

  exportExpensesPdf(pharmacyId: number, page = 0, size = 100, preview = true): Observable<Blob> {
    return this.exportReport({
      fileName: `expenses_${new Date().toISOString().split('T')[0]}.pdf`,
      fileType: 'pdf',
      endpoint: '/expenses/pdf',
      params: { pharmacyId, page, size },
      preview
    });
  }

  exportExpensesExcel(pharmacyId: number, page = 0, size = 100, preview = false): Observable<Blob> {
    return this.exportReport({
      fileName: `expenses_${new Date().toISOString().split('T')[0]}.xlsx`,
      fileType: 'excel',
      endpoint: '/expenses/excel',
      params: { pharmacyId, page, size },
      preview
    });
  }

  exportFinancialExcel(pharmacyId: number, startDate?: string, endDate?: string, preview = false): Observable<Blob> {
    const params: Record<string, any> = { pharmacyId };
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return this.exportReport({
      fileName: `financial_${startDate || 'start'}_to_${endDate || 'end'}.xlsx`,
      fileType: 'excel',
      endpoint: '/financial/excel',
      params,
      preview
    });
  }

  exportSalesPdf(pharmacyId: number, startDate: string, endDate: string, preview = false): Observable<Blob> {
    return this.exportReport({
      fileName: `sales_${startDate}_to_${endDate}.pdf`,
      fileType: 'pdf',
      endpoint: '/sales/pdf',
      params: { pharmacyId, startDate, endDate },
      preview
    });
  }

  exportSalesExcel(pharmacyId: number, startDate: string, endDate: string, preview = false): Observable<Blob> {
    return this.exportReport({
      fileName: `sales_${startDate}_to_${endDate}.xlsx`,
      fileType: 'excel',
      endpoint: '/sales/excel',
      params: { pharmacyId, startDate, endDate },
      preview
    });
  }

  exportExpiryPdf(pharmacyId: number, preview = false): Observable<Blob> {
    return this.exportReport({
      fileName: `expiry_${new Date().toISOString().split('T')[0]}.pdf`,
      fileType: 'pdf',
      endpoint: '/expiry/pdf',
      params: { pharmacyId },
      preview
    });
  }

  exportExpiryExcel(pharmacyId: number, preview = false): Observable<Blob> {
    return this.exportReport({
      fileName: `expiry_${new Date().toISOString().split('T')[0]}.xlsx`,
      fileType: 'excel',
      endpoint: '/expiry/excel',
      params: { pharmacyId },
      preview
    });
  }
}
