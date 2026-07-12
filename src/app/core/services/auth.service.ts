import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, timer, Subscription } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../models/LoginRequest.model';
import { RegisterRequest } from '../models/RegisterRequest.model';
import { AuthResponse } from '../models/AuthResponse.model';
import { SessionStatus, ExtendSessionResponse, SessionWarningData } from '../models/session-status.model';
import { MatDialog } from '@angular/material/dialog';
import { SessionWarningDialogComponent } from '../../shared/components/session-warning-dialog/session-warning-dialog.component';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Token expiry buffer: refresh if token expires within 5 minutes
  private readonly TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

  // Keepalive interval: send request every 60 seconds
  private readonly KEEPALIVE_INTERVAL_MS = 60 * 1000;

  // Keepalive subscription
  private keepaliveSubscription: Subscription | null = null;

  // Track if warning dialog is open
  private warningDialogOpen = false;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setSession(response);
        this.startSessionKeepalive();
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        this.setSession(response);
        this.startSessionKeepalive();
      })
    );
  }

  /**
   * Logout: calls backend to revoke session, then clears local storage
   */
  logout(): Observable<any> {
    this.stopSessionKeepalive();

    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
        tap(() => {
          this.clearSession();
        }),
        catchError(() => {
          this.clearSession();
          return of(null);
        })
      );
    }
    this.clearSession();
    return of(null);
  }

  /**
   * Force logout without calling backend (used for SESSION_EXPIRED)
   */
  forceLogout(): void {
    this.stopSessionKeepalive();
    this.clearSession();
  }

  /**
   * Refresh the access token using the refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(environment.refreshTokenKey);
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh?refreshToken=${refreshToken}`, {}).pipe(
      tap(response => {
        this.setSession(response);
      }),
      catchError(error => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Extend session manually (called from SESSION_WARNING dialog)
   */
  extendSession(): Observable<ExtendSessionResponse> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
    return this.http.post<ExtendSessionResponse>(`${this.apiUrl}/extend-session`, {}, { headers }).pipe(
      tap(response => {
        if (response.success && response.expiresAt) {
          localStorage.setItem('expiresAt', response.expiresAt);
        }
        if (response.remainingExtensions !== undefined) {
          localStorage.setItem('remainingExtensions', response.remainingExtensions.toString());
        }
      }),
      catchError(error => {
        if (
          error.status === 401 ||
          error.error?.code === 'MAX_EXTENSIONS_REACHED' ||
          error.error?.code === 'SESSION_EXPIRED'
        ) {
          this.clearSession();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current session status
   */
  getSessionStatus(): Observable<SessionStatus> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
    return this.http.get<SessionStatus>(`${this.apiUrl}/session-status`, { headers });
  }

  /**
   * Update local session data from response headers (X-Session-Extended, X-Remaining-Extensions)
   */
  updateLocalSession(remainingExtensions: string | null): void {
    if (remainingExtensions !== null) {
      localStorage.setItem('remainingExtensions', remainingExtensions);
    }
    // The expiresAt is updated automatically from the response
    const user = this.getCurrentUser();
    if (user) {
      this.currentUserSubject.next({ ...user });
    }
  }

  /**
   * Start checking session status every minute.
   */
  startSessionKeepalive(): void {
    // Stop any existing keepalive
    this.stopSessionKeepalive();

    // Start new keepalive interval
    this.keepaliveSubscription = timer(0, this.KEEPALIVE_INTERVAL_MS)
      .pipe(
        switchMap(() => {
          const token = this.getToken();
          if (!token) {
            this.stopSessionKeepalive();
            return throwError(() => new Error('No token'));
          }

          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

          return this.http.get<SessionStatus>(`${this.apiUrl}/session-status`, { headers });
        })
      )
      .subscribe({
        next: (status: SessionStatus) => {
          const isActive = status.isActive ?? status.active ?? false;
          if (!isActive) {
            this.forceLogout();
            this.router.navigate(['/auth/login'], { queryParams: { expired: true } });
            return;
          }

          // Update local session data from response
          if (status.remainingExtensions !== undefined) {
            localStorage.setItem('remainingExtensions', status.remainingExtensions.toString());
          }
          if (status.expiresAt) {
            localStorage.setItem('expiresAt', status.expiresAt);
          }

          if (status.remainingMinutes <= status.warningThreshold) {
            this.handleSessionWarning({
              remainingMinutes: status.remainingMinutes,
              canExtend: status.canExtend,
              remainingExtensions: status.remainingExtensions
            });
          }
        },
        error: (error) => {
          // Handle SESSION_EXPIRED
          if (error.status === 401 && error.error?.code === 'SESSION_EXPIRED') {
            this.forceLogout();
            this.router.navigate(['/auth/login'], { queryParams: { expired: true } });
            return;
          }

          // Handle MAX_EXTENSIONS_REACHED
          if (error.status === 400 && error.error?.code === 'MAX_EXTENSIONS_REACHED') {
            this.forceLogout();
            this.router.navigate(['/auth/login']);
            return;
          }

          // Other errors - log but don't logout
          console.error('Keepalive error:', error);
        }
      });
  }

  /**
   * Stop sending keepalive requests
   */
  stopSessionKeepalive(): void {
    if (this.keepaliveSubscription) {
      this.keepaliveSubscription.unsubscribe();
      this.keepaliveSubscription = null;
    }
  }

  /**
   * Handle SESSION_WARNING - show dialog to user
   */
  private handleSessionWarning(data: SessionWarningData): void {
    // Prevent multiple dialogs
    if (this.warningDialogOpen) return;
    this.warningDialogOpen = true;

    const dialogRef = this.dialog.open(SessionWarningDialogComponent, {
      width: '400px',
      disableClose: true,
      data: data
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      this.warningDialogOpen = false;

      if (result) {
        // User clicked "Extend" → call extend-session API
        this.extendSession().subscribe({
          next: (response) => {
            if (!response.success) {
              this.forceLogout();
              this.router.navigate(['/auth/login']);
            }
          },
          error: (err) => {
            if (
              err.status === 401 ||
              err.error?.code === 'MAX_EXTENSIONS_REACHED' ||
              err.error?.code === 'SESSION_EXPIRED'
            ) {
              this.forceLogout();
              this.router.navigate(['/auth/login']);
            }
          }
        });
      } else {
        // User clicked "Logout" → revoke backend session and clear local data
        this.logout().subscribe({
          next: () => this.router.navigate(['/auth/login']),
          error: () => this.router.navigate(['/auth/login'])
        });
      }
    });
  }

  /**
   * Check if keepalive is running
   */
  isKeepaliveRunning(): boolean {
    return this.keepaliveSubscription !== null && !this.keepaliveSubscription.closed;
  }

  /**
   * Check if the access token is about to expire (within buffer window)
   */
  isTokenExpiringSoon(): boolean {
    const user = this.getCurrentUser();
    if (!user?.expiresIn) {
      return false;
    }
    const now = Date.now();
    return (user.expiresIn - now) < this.TOKEN_EXPIRY_BUFFER_MS;
  }

  /**
   * Check if user is logged in (has a valid token in storage)
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem(environment.tokenKey);
  }

  /**
   * Get the current access token
   */
  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(environment.refreshTokenKey);
  }

  /**
   * Get the current user object
   */
  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get user ID
   */
  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.userId || null;
  }

  /**
   * Get pharmacy ID
   */
  getPharmacyId(): number | null {
    const user = this.getCurrentUser();
    return user?.pharmacyId || null;
  }

  /**
   * Get pharmacy info
   */
  getPharmacyInfo(): any {
    const user = this.getCurrentUser();
    if (user?.pharmacyId) {
      return {
        id: user.pharmacyId,
        name: user.pharmacyName || 'صيدليتي الذكية',
        address: '',
        phone: '',
        email: ''
      };
    }
    return null;
  }

  /**
   * Get session expiry time (ISO datetime)
   */
  getExpiresAt(): string | null {
    return localStorage.getItem('expiresAt');
  }

  /**
   * Get session timeout in minutes
   */
  getSessionTimeout(): number | null {
    const timeout = localStorage.getItem('sessionTimeout');
    return timeout ? parseInt(timeout, 10) : null;
  }

  /**
   * Get remaining extensions
   */
  getRemainingExtensions(): number {
    const val = localStorage.getItem('remainingExtensions');
    return val ? parseInt(val, 10) : 0;
  }

  /**
   * Get max extensions
   */
  getMaxExtensions(): number {
    const user = this.getCurrentUser();
    return user?.maxExtensions || 3;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Save session data to local storage and update the subject
   */
  private setSession(response: AuthResponse): void {
    localStorage.setItem(environment.tokenKey, response.accessToken);
    localStorage.setItem(environment.refreshTokenKey, response.refreshToken);
    if (response.expiresAt) {
      localStorage.setItem('expiresAt', response.expiresAt);
    }
    if (response.sessionTimeout) {
      localStorage.setItem('sessionTimeout', response.sessionTimeout.toString());
    }
    if (response.remainingExtensions !== undefined) {
      localStorage.setItem('remainingExtensions', response.remainingExtensions.toString());
    }
    localStorage.setItem(environment.userKey, JSON.stringify(response));
    this.currentUserSubject.next(response);
  }

  /**
   * Clear all session data from storage
   */
  private clearSession(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('sessionTimeout');
    localStorage.removeItem('remainingExtensions');
    localStorage.removeItem(environment.userKey);
    this.currentUserSubject.next(null);
  }

  /**
   * Load user from storage on app initialization
   */
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem(environment.userKey);
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as AuthResponse;
        this.currentUserSubject.next(user);
      } catch {
        this.clearSession();
      }
    }
  }
}
