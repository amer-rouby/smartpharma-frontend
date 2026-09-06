import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CastResponse, HasInterception, InterceptParam } from 'cast-response';
import { AuthService } from '../../services/auth.service';
import { CrudServiceContract } from '../interfaces/crud-service-contract.interface';
import { PagedResult } from '../classes/paged-result';

// Generic base CRUD service. Every pharmacy-scoped SmartPharma endpoint expects
// a `pharmacyId` (query param on reads/deletes, body field on writes) - this base
// attaches it automatically so concrete services never have to repeat that logic.
export abstract class CrudService<Model, PrimaryKeyType = number> implements CrudServiceContract<Model, PrimaryKeyType> {
  protected readonly http = inject(HttpClient);
  protected readonly authService = inject(AuthService);

  abstract getSegmentUrl(): string;

  protected getPharmacyId(): number {
    return this.authService.getPharmacyId() ?? 1;
  }

  getCreateEndpoint(): string {
    return this.getSegmentUrl();
  }

  getUpdateEndpoint(id: PrimaryKeyType): string {
    return `${this.getSegmentUrl()}/${id}`;
  }

  getDeleteEndpoint(id: PrimaryKeyType): string {
    return `${this.getSegmentUrl()}/${id}`;
  }

  getGetByIdEndpoint(id: PrimaryKeyType): string {
    return `${this.getSegmentUrl()}/${id}`;
  }

  getGetAllEndpoint(): string {
    return `${this.getSegmentUrl()}/page`;
  }

  @HasInterception
  @CastResponse(undefined, { fallback: '$default' })
  create(@InterceptParam() model: Model): Observable<Model> {
    return this.http.post<Model>(this.getCreateEndpoint(), model);
  }

  @HasInterception
  @CastResponse(undefined, { fallback: '$default' })
  update(@InterceptParam() model: Model): Observable<Model> {
    const id = (model as Record<string, unknown>)['id'] as PrimaryKeyType;
    return this.http.put<Model>(this.getUpdateEndpoint(id), model, {
      params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
    });
  }

  delete(id: PrimaryKeyType): Observable<void> {
    return this.http.delete<void>(this.getDeleteEndpoint(id), {
      params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
    });
  }

  @CastResponse(undefined, { fallback: '$default' })
  getById(id: PrimaryKeyType): Observable<Model> {
    return this.http.get<Model>(this.getGetByIdEndpoint(id), {
      params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
    });
  }

  @CastResponse(undefined, { fallback: '$pagination' })
  getAll(options?: Record<string, unknown>): Observable<PagedResult<Model>> {
    const params = new HttpParams({
      fromObject: { ...options, pharmacyId: this.getPharmacyId() } as never,
    });
    return this.http.get<PagedResult<Model>>(this.getGetAllEndpoint(), { params });
  }
}
