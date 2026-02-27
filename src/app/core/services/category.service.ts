import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models';
import { Category, CategoryRequest, CategoriesCountResponse } from '../models/category';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getCategoriesCount(): Observable<number> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<CategoriesCountResponse>>(`${this.apiUrl}/count`, {
      params: new HttpParams().set('pharmacyId', pharmacyId.toString())
    }).pipe(
      map(response => response.data?.count || 0),
      catchError(() => of(0))
    );
  }

  getCategories(): Observable<Category[]> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return of([]);
    }

    return this.http.get<ApiResponse<Category[]>>(this.apiUrl, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data || []),
      catchError(this.handleError<Category[]>('getCategories', []))
    );
  }

  getActiveCategories(): Observable<Category[]> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return of([]);
    }

    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/active`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data || []),
      catchError(this.handleError<Category[]>('getActiveCategories', []))
    );
  }

  getCategory(id: number): Observable<Category> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<Category>(`getCategory id=${id}`))
    );
  }

  createCategory(category: CategoryRequest): Observable<Category> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    const request: CategoryRequest = {
      ...category,
      pharmacyId
    };

    return this.http.post<ApiResponse<Category>>(this.apiUrl, request).pipe(
      map(response => response.data),
      catchError(this.handleError<Category>('createCategory'))
    );
  }

  updateCategory(id: number, category: CategoryRequest): Observable<Category> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/${id}`, category, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<Category>(`updateCategory id=${id}`))
    );
  }

  deleteCategory(id: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      catchError(this.handleError<void>(`deleteCategory id=${id}`))
    );
  }

  searchCategories(query: string): Observable<Category[]> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId || !query?.trim()) {
      return of([]);
    }

    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/search`, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('query', query.trim())
    }).pipe(
      map(response => response.data || []),
      catchError(this.handleError<Category[]>('searchCategories', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
