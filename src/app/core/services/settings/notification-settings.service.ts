import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { ApiResponse } from '../../models';

export interface NotificationSettings {
  id: number;
  userId: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  notifyLowStock: boolean;
  notifyOutOfStock: boolean;
  notifyExpiryWarning: boolean;
  notifyExpiredProducts: boolean;
  notifyNewSale: boolean;
  notifyLargeSale: boolean;
  notifyRefund: boolean;
  notifyNewExpense: boolean;
  notifyLargeExpense: boolean;
  notifySystemUpdates: boolean;
  notifyBackupReminder: boolean;
  notifySecurityAlerts: boolean;
  updatedAt: string;
}

export interface NotificationSettingsRequest {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  notifyLowStock?: boolean;
  notifyOutOfStock?: boolean;
  notifyExpiryWarning?: boolean;
  notifyExpiredProducts?: boolean;
  notifyNewSale?: boolean;
  notifyLargeSale?: boolean;
  notifyRefund?: boolean;
  notifyNewExpense?: boolean;
  notifyLargeExpense?: boolean;
  notifySystemUpdates?: boolean;
  notifyBackupReminder?: boolean;
  notifySecurityAlerts?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationSettingsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/settings/notifications';

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
