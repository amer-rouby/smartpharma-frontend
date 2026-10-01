import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { ApiResponse } from '../../models';
import { SecuritySettings } from '../../models/settings/security-settings.model';
import { PasswordChangeRequest } from '../../models/settings/profile.model';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SecuritySettingsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/settings/security`;

  private getUserId(): number {
    const user = this.authService.getCurrentUser();
    return user?.userId || 1;
  }

  getSettings(): Observable<SecuritySettings> {
    const userId = this.getUserId();

    return this.http.get<ApiResponse<SecuritySettings>>(this.apiUrl, {
      params: new HttpParams().set('userId', userId)
    }).pipe(
      map(response => response.data)
    );
  }

  changePassword(request: PasswordChangeRequest): Observable<SecuritySettings> {
    const userId = this.getUserId();

    return this.http.post<ApiResponse<SecuritySettings>>(`${this.apiUrl}/change-password`, {
      oldPassword: request.oldPassword,
      newPassword: request.newPassword
    }, {
      params: new HttpParams().set('userId', userId)
    }).pipe(
      map(response => response.data)
    );
  }

  // 2FA for the signed-in user (the API takes the user from the token).
  // Errors are left to the caller: codes like TWO_FACTOR_INVALID_CODE.

  /** Starts setup: a new secret, not active until confirmed with a code. */
  setupTwoFactor(): Observable<TwoFactorSetup> {
    return this.http.post<ApiResponse<TwoFactorSetup>>(`${this.apiUrl}/2fa/setup`, {}).pipe(
      map(response => response.data)
    );
  }

  verifyTwoFactor(code: string): Observable<SecuritySettings> {
    return this.http.post<ApiResponse<SecuritySettings>>(`${this.apiUrl}/2fa/verify`, { code }).pipe(
      map(response => response.data)
    );
  }

  disableTwoFactor(code: string): Observable<SecuritySettings> {
    return this.http.post<ApiResponse<SecuritySettings>>(`${this.apiUrl}/2fa/disable`, { code }).pipe(
      map(response => response.data)
    );
  }
}

export interface TwoFactorSetup {
  /** Base32 secret for typing into the app by hand. */
  secret: string;
  /** otpauth:// URI, rendered here as a QR code. */
  otpAuthUrl: string;
}
