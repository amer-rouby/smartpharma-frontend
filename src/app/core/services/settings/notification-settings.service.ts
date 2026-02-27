import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { ApiResponse } from '../../models';
import { NotificationSettings, NotificationSettingsRequest } from '../../models/settings/notification-setting.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationSettingsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/settings/notifications`;

  private getUserId(): number {
    const user = this.authService.getCurrentUser();
    return user?.userId || 1;
  }

  getSettings(): Observable<NotificationSettings> {
    const userId = this.getUserId();

    return this.http.get<ApiResponse<NotificationSettings>>(this.apiUrl, {
      params: new HttpParams().set('userId', userId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<NotificationSettings>('getSettings'))
    );
  }

  updateSettings(request: NotificationSettingsRequest): Observable<NotificationSettings> {
    const userId = this.getUserId();

    return this.http.put<ApiResponse<NotificationSettings>>(this.apiUrl, request, {
      params: new HttpParams().set('userId', userId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<NotificationSettings>('updateSettings'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
