import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiResponse, PaginatedResponse} from '../models';
import { Product, ProductRequest, ProductsCountResponse } from '../models/product.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  getProductsCount(): Observable<number> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<ProductsCountResponse>>(`${this.apiUrl}/count`, {
      params: new HttpParams().set('pharmacyId', pharmacyId.toString())
    }).pipe(
      map(response => response.data?.count || 0),
      catchError(error => {
        console.error('Error loading products count:', error);
        return of(0);
      })
    );
  }

  getProducts(page: number = 0, size: number = 10): Observable<PaginatedResponse<Product>> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return of(this.getEmptyPaginatedResponse<Product>());
    }

    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('page', page)
        .set('size', size)
    });
  }

  getProductsPaged(page: number, size: number, search?: string, category?: string,
                    sortBy = 'name', sortDirection = 'asc'): Observable<PaginatedResponse<Product>> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return of(this.getEmptyPaginatedResponse<Product>());
    }

    let params = new HttpParams()
      .set('pharmacyId', pharmacyId)
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (search?.trim()) params = params.set('search', search.trim());
    if (category && category !== 'all') params = params.set('category', category);

    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(`${this.apiUrl}/page`, { params }).pipe(
      map(response => response.data || this.getEmptyPaginatedResponse<Product>())
    );
  }

  getProductsList(): Observable<Product[]> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return of([]);
    }

    return this.http.get<Product[]>(this.apiUrl, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    });
  }

  getProduct(id: number): Observable<Product> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    return this.http.get<Product>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    });
  }

  createProduct(product: ProductRequest): Observable<Product> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    return this.http.post<Product>(this.apiUrl, product, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    });
  }

  updateProduct(id: number, product: ProductRequest): Observable<Product> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    });
  }

  deleteProduct(id: number): Observable<void> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return throwError(() => new Error('Pharmacy ID is required'));
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    });
  }

  searchProducts(query: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<Product>> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId || !query?.trim()) {
      return of(this.getEmptyPaginatedResponse<Product>());
    }

    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/search`, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('query', query.trim())
        .set('page', page)
        .set('size', size)
    });
  }

  getLowStockProducts(): Observable<Product[]> {
    const pharmacyId = this.getPharmacyId();

    if (!pharmacyId) {
      return of([]);
    }

    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`, {
      params: new HttpParams().set('pharmacyId', pharmacyId)
    });
  }

  searchByBarcode(barcode: string): Observable<Product | null> {
    const pharmacyId = this.getPharmacyId();

    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/search`, {
      params: new HttpParams()
        .set('pharmacyId', pharmacyId)
        .set('query', barcode)
    }).pipe(
      map(response => {
        const products = response.data || response;
        return products.find(p => p.barcode === barcode) || null;
      }),
      catchError(() => of(null))
    );
  }

  private getEmptyPaginatedResponse<T>(): PaginatedResponse<T> {
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: 0,
      number: 0,
      first: true,
      last: true,
      empty: true
    };
  }

}
