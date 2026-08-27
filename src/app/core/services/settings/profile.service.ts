import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { PasswordChangeRequest, Profile, ProfileUpdateRequest } from '../../models/settings/profile.model';
import { ApiResponse } from '../../models/sale.model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/profile`;

  private getUserId(): number {
    return this.authService.getUserId() || 1;
  }

  getProfile(): Observable<Profile> {
    const userId = this.getUserId();

    return this.http.get<ApiResponse<Profile>>(this.apiUrl, {
      params: new HttpParams().set('userId', userId)
    }).pipe(
      map(response => response.data)
    );
  }

  updateProfile(request: ProfileUpdateRequest): Observable<Profile> {
    const userId = this.getUserId();

    return this.http.put<ApiResponse<Profile>>(this.apiUrl, request, {
      params: new HttpParams().set('userId', userId)
    }).pipe(
      map(response => response.data)
    );
  }

  changePassword(request: PasswordChangeRequest): Observable<Profile> {
    const userId = this.getUserId();

    return this.http.post<ApiResponse<Profile>>(`${this.apiUrl}/change-password`, {
      oldPassword: request.oldPassword,
      newPassword: request.newPassword
    }, {
      params: new HttpParams().set('userId', userId)
    }).pipe(
      map(response => response.data)
    );
  }
}
