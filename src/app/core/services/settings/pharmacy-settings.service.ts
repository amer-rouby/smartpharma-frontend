import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { ApiResponse } from '../../models';
import { PharmacySettings, PharmacySettingsRequest } from '../../models/settings/pharmacy-settings.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PharmacySettingsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/settings/pharmacy`;

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getSettings(): Observable<PharmacySettings> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<PharmacySettings>>(this.apiUrl, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PharmacySettings>('getSettings'))
    );
  }

  updateSettings(request: PharmacySettingsRequest): Observable<PharmacySettings> {
    const pharmacyId = this.getPharmacyId();

    return this.http.put<ApiResponse<PharmacySettings>>(this.apiUrl, request, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PharmacySettings>('updateSettings'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
