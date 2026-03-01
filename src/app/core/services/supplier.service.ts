import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiResponse, PaginatedResponse } from '../models';
import { Supplier } from '../models/purchase-order.model';
import { SupplierRequest } from '../models/purchase-request.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/suppliers';

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getSuppliers(page: number = 0, size: number = 10): Observable<PaginatedResponse<Supplier>> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<PaginatedResponse<Supplier>>>(`${this.apiUrl}/paginated`, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('page', page)
        .set('size', size)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<PaginatedResponse<Supplier>>('getSuppliers'))
    );
  }

  getAllSuppliers(): Observable<Supplier[]> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<Supplier[]>>(this.apiUrl, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<Supplier[]>('getAllSuppliers', []))
    );
  }

  getSupplier(id: number): Observable<Supplier> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<Supplier>>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<Supplier>('getSupplier'))
    );
  }

  createSupplier(request: SupplierRequest): Observable<Supplier> {
    const pharmacyId = this.getPharmacyId();
    return this.http.post<ApiResponse<Supplier>>(this.apiUrl, request, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<Supplier>('createSupplier'))
    );
  }

  updateSupplier(id: number, request: SupplierRequest): Observable<Supplier> {
    const pharmacyId = this.getPharmacyId();
    return this.http.put<ApiResponse<Supplier>>(`${this.apiUrl}/${id}`, request, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<Supplier>('updateSupplier'))
    );
  }

  deleteSupplier(id: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<void>('deleteSupplier'))
    );
  }

  searchSuppliers(query: string): Observable<Supplier[]> {
    const pharmacyId = this.getPharmacyId();
    return this.http.get<ApiResponse<Supplier[]>>(`${this.apiUrl}/search`, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('query', query)
    }).pipe(
      map(response => response.data),
      catchError(this.handleError<Supplier[]>('searchSuppliers', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
