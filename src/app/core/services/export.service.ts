import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { ExportOptions } from '../models/Export.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
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

    return this.http.get(url, {
      headers,
      params,
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        if (options.preview) {
          this.openBlobInNewTab(blob, options.fileType);
          this.snackBar.open(`تم فتح ${options.fileType.toUpperCase()} في نافذة جديدة`, 'إغلاق', { duration: 3000 });
        } else if (!options.onSuccess) {
          this.downloadBlob(blob, options.fileName);
          this.snackBar.open(`تم تحميل ${options.fileType.toUpperCase()} بنجاح`, 'إغلاق', { duration: 3000 });
        }
      }),
      catchError(error => {
        const message = options.onError ? null : `فشل تحميل ملف ${options.fileType.toUpperCase()}`;
        if (message) {
          this.snackBar.open(message, 'إغلاق', { duration: 3000 });
        }
        if (options.onError) {
          options.onError(error);
        }
        console.error(`Export error (${options.fileType}):`, error);
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

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 300000);
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  exportExpensesPdf(
    pharmacyId: number,
    page: number = 0,
    size: number = 100,
    preview: boolean = true
  ): Observable<Blob> {
    return this.exportReport({
      fileName: `expenses_${new Date().toISOString().split('T')[0]}.pdf`,
      fileType: 'pdf',
      endpoint: '/expenses/pdf',
      params: { pharmacyId, page, size },
      preview
    });
  }

  exportExpensesExcel(
    pharmacyId: number,
    page: number = 0,
    size: number = 100,
    preview: boolean = false
  ): Observable<Blob> {
    return this.exportReport({
      fileName: `expenses_${new Date().toISOString().split('T')[0]}.xlsx`,
      fileType: 'excel',
      endpoint: '/expenses/excel',
      params: { pharmacyId, page, size },
      preview
    });
  }

  exportFinancialExcel(
    pharmacyId: number,
    startDate?: string,
    endDate?: string,
    preview: boolean = false
  ): Observable<Blob> {
    const params: Record<string, any> = { pharmacyId };
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;

    return this.exportReport({
      fileName: `financial_report_${startDate || 'start'}_to_${endDate || 'end'}.xlsx`,
      fileType: 'excel',
      endpoint: '/financial/excel',
      params,
      preview
    });
  }

  exportCustom(options: ExportOptions): Observable<Blob> {
    return this.exportReport(options);
  }
}
