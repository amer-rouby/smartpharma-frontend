import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models';
import { User, UserRequest, UsersCountResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/users';

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getUsersCount(): Observable<number> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<UsersCountResponse>>(`${this.apiUrl}/count`, {
      params: new HttpParams().set('pharmacyId', pharmacyId.toString())
    }).pipe(
      map(response => response.data?.count || 0),
      catchError(() => of(0))
    );
  }

  getUsers(): Observable<User[]> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return of([]);
    }

    return this.http.get<ApiResponse<User[]>>(this.apiUrl, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data || []),
      catchError(this.handleError<User[]>('getUsers', []))
    );
  }

  getActiveUsers(): Observable<User[]> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return of([]);
    }

    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/active`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data || []),
      catchError(this.handleError<User[]>('getActiveUsers', []))
    );
  }

  getUser(id: number): Observable<User> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<User>(`getUser id=${id}`))
    );
  }

  createUser(user: UserRequest): Observable<User> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    const request: UserRequest = {
      ...user,
      pharmacyId
    };

    return this.http.post<ApiResponse<User>>(this.apiUrl, request).pipe(
      map(response => response.data),
      catchError(this.handleError<User>('createUser'))
    );
  }

  updateUser(id: number, user: UserRequest): Observable<User> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, user, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<User>(`updateUser id=${id}`))
    );
  }

  deleteUser(id: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      catchError(this.handleError<void>(`deleteUser id=${id}`))
    );
  }

  searchUsers(query: string): Observable<User[]> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId || !query?.trim()) {
      return of([]);
    }

    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/search`, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('query', query.trim())
    }).pipe(
      map(response => response.data || []),
      catchError(this.handleError<User[]>('searchUsers', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
