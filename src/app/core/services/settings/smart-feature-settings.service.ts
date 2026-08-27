import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { ApiResponse } from '../../models';
import { SmartFeatureSettings, SmartFeatureSettingsRequest } from '../../models/settings/smart-feature-settings.model';
import { environment } from '../../../../environments/environment';

const ALL_ENABLED: SmartFeatureSettings = {
  id: 0,
  pharmacyId: 0,
  stockPredictionEnabled: true,
  reorderRecommendationsEnabled: true,
  pricingRecommendationsEnabled: true,
  supplierRecommendationsEnabled: true,
  dashboardInsightsEnabled: true,
  dailyBriefEnabled: true,
  anomalyDetectionEnabled: true,
  realtimeUpdatesEnabled: true,
  voiceSearchEnabled: true,
  aiAssistantEnabled: true,
  eInvoiceEnabled: false,
  offlineModeEnabled: false
};

@Injectable({
  providedIn: 'root'
})
export class SmartFeatureSettingsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/settings/smart-features`;

  // Cached flags so feature components can gate themselves synchronously
  // (`if (!flags().stockPredictionEnabled) return;`) instead of a network
  // round-trip per check. Refreshed on login and whenever settings are saved.
  readonly flags = signal<SmartFeatureSettings>(ALL_ENABLED);

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getSettings(): Observable<SmartFeatureSettings> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<SmartFeatureSettings>>(this.apiUrl, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      tap(settings => this.flags.set(settings)),
      // A failed fetch falls back to "everything enabled" rather than
      // breaking every screen that reads a flag - reads can fail safe.
      // Saving a change (updateSettings below) must NOT fail silently the
      // same way, since the user is waiting on confirmation of their action.
      catchError(() => of(ALL_ENABLED))
    );
  }

  updateSettings(request: SmartFeatureSettingsRequest): Observable<SmartFeatureSettings> {
    const pharmacyId = this.getPharmacyId();

    return this.http.put<ApiResponse<SmartFeatureSettings>>(this.apiUrl, request, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      tap(settings => this.flags.set(settings))
    );
  }
}
