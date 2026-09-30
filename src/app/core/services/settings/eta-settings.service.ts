import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../models';
import { PharmacyContextService } from '../pharmacy-context.service';
import {
  EtaPosDevice,
  EtaPosDeviceRequest,
  EtaSettings,
  EtaSettingsRequest
} from '../../models/settings/eta-settings.model';

// ETA taxpayer data, credentials and POS devices. Errors are left to the
// caller: these are admin actions the user is waiting on, so a failure must
// be shown rather than swallowed.
@Injectable({ providedIn: 'root' })
export class EtaSettingsService {
  private readonly http = inject(HttpClient);
  private readonly pharmacy = inject(PharmacyContextService);
  private readonly apiUrl = this.pharmacy.apiUrl('e-invoice/settings');

  getSettings(): Observable<EtaSettings> {
    return this.http.get<ApiResponse<EtaSettings>>(this.apiUrl).pipe(map((r) => r.data));
  }

  saveSettings(request: EtaSettingsRequest): Observable<EtaSettings> {
    return this.http.put<ApiResponse<EtaSettings>>(this.apiUrl, request).pipe(map((r) => r.data));
  }

  getDevices(): Observable<EtaPosDevice[]> {
    return this.http.get<ApiResponse<EtaPosDevice[]>>(`${this.apiUrl}/devices`).pipe(map((r) => r.data));
  }

  createDevice(request: EtaPosDeviceRequest): Observable<EtaPosDevice> {
    return this.http.post<ApiResponse<EtaPosDevice>>(`${this.apiUrl}/devices`, request).pipe(map((r) => r.data));
  }

  updateDevice(id: number, request: EtaPosDeviceRequest): Observable<EtaPosDevice> {
    return this.http.put<ApiResponse<EtaPosDevice>>(`${this.apiUrl}/devices/${id}`, request).pipe(map((r) => r.data));
  }

  testConnection(id: number): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/devices/${id}/test`, {}).pipe(map((r) => r.data));
  }
}
