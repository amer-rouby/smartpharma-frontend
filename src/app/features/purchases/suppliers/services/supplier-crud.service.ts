import { Injectable, Type } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CastResponse, CastResponseContainer } from 'cast-response';
import { CrudWithDialogService, PagedResult, RegisterServiceMixin } from '../../../../core/crud';
import { environment } from '../../../../../environments/environment';
import { SupplierModel } from '../models/supplier.model';
import { SupplierDialogComponent } from '../supplier-dialog/supplier-dialog.component';

@CastResponseContainer({
  $default: {
    model: () => SupplierModel,
  },
  $pagination: {
    model: () => PagedResult,
    shape: {
      'content.*': () => SupplierModel,
    },
  },
})
@Injectable({ providedIn: 'root' })
export class SupplierCrudService extends RegisterServiceMixin(CrudWithDialogService)<SupplierModel, SupplierDialogComponent, number> {
  $$serviceName = 'SupplierCrudService';

  override getSegmentUrl(): string {
    return `${environment.apiUrl}/suppliers`;
  }

  override getGetAllEndpoint(): string {
    return `${this.getSegmentUrl()}/paginated`;
  }

  override getDialogComponent(): Type<SupplierDialogComponent> {
    return SupplierDialogComponent;
  }

  override getModelInstance(): SupplierModel {
    return new SupplierModel();
  }

  // SupplierRequest has no id/pharmacyId/timestamps at all - pharmacyId goes
  // in the query string instead (see create() override below).
  override toRequestPayload(model: SupplierModel): unknown {
    const { name, contactPerson, phone, email, address, city, status, notes } = model;
    return { name, contactPerson, phone, email, address, city, status, notes };
  }

  // Unlike the base pattern, this endpoint takes pharmacyId as a query param
  // on create too (not just update/delete/getAll).
  @CastResponse(undefined, { fallback: '$default', unwrap: 'data' })
  override create(model: SupplierModel): Observable<SupplierModel> {
    return this.http.post<SupplierModel>(this.getCreateEndpoint(), this.toRequestPayload(model), {
      params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
    });
  }
}
