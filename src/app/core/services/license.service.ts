import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { GeneratedLicenseCode, LicenseStatus } from '../models/license.model';

@Injectable({ providedIn: 'root' })
export class LicenseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/license`;

  // Cached for the session; refreshed after a successful renew.
  private readonly cachedStatus = signal<LicenseStatus | null>(null);

  /** Returns the cached status if already fetched this session, otherwise fetches it. */
  ensureStatusLoaded(): Observable<LicenseStatus> {
    const cached = this.cachedStatus();
    if (cached) return of(cached);
    return this.fetchStatus();
  }

  fetchStatus(): Observable<LicenseStatus> {
    return this.http.get<ApiResponse<LicenseStatus>>(`${this.baseUrl}/status`).pipe(
      map((response) => response.data),
      tap((status) => this.cachedStatus.set(status))
    );
  }

  renew(code: string): Observable<LicenseStatus> {
    return this.http.post<ApiResponse<LicenseStatus>>(`${this.baseUrl}/renew`, { code }).pipe(
      map((response) => response.data),
      tap((status) => this.cachedStatus.set(status))
    );
  }

  // Vendor-only: works only where license.private-key-path is configured.
  generateCode(pharmacyId: number, months: number): Observable<GeneratedLicenseCode> {
    return this.http.post<ApiResponse<GeneratedLicenseCode>>(`${this.baseUrl}/generate`, { pharmacyId, months }).pipe(
      map((response) => response.data)
    );
  }
}
