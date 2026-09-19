import { Injectable, Type } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CastResponse, CastResponseContainer } from 'cast-response';
import { CrudWithDialogService, PagedResult, RegisterServiceMixin } from '../../../../core/crud';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models';
import { Product } from '../../../../core/models/product.model';
import { StockBatchModel } from '../models/stock-batch.model';
import { StockBatchDialogComponent } from '../../stock-batch-dialog/stock-batch-dialog.component';

@CastResponseContainer({
  $default: {
    model: () => StockBatchModel,
  },
  $pagination: {
    model: () => PagedResult,
    shape: {
      'content.*': () => StockBatchModel,
    },
  },
})
@Injectable({ providedIn: 'root' })
export class StockBatchCrudService extends RegisterServiceMixin(CrudWithDialogService)<StockBatchModel, StockBatchDialogComponent, number> {
  $$serviceName = 'StockBatchCrudService';

  override getSegmentUrl(): string {
    return `${environment.apiUrl}/stock/batches`;
  }

  // Unlike most entities, GET /api/stock/batches itself takes page/size as
  // query params directly (no /page suffix) - the base class default of
  // `${segmentUrl}/page` doesn't exist on the backend, so it 404s and, worse,
  // matches the GET /api/stock/batches/{id} mapping instead, which then
  // fails trying to parse "page" as the Long id.
  override getGetAllEndpoint(): string {
    return this.getSegmentUrl();
  }

  override getDialogComponent(): Type<StockBatchDialogComponent> {
    return StockBatchDialogComponent;
  }

  override getModelInstance(): StockBatchModel {
    return new StockBatchModel();
  }

  // StockBatchRequest has no id/productName/createdAt/updatedAt/pharmacyId/version.
  override toRequestPayload(model: StockBatchModel): unknown {
    const { productId, batchNumber, quantityCurrent, quantityInitial, expiryDate, productionDate, location, shelf, warehouse, notes, status } = model;
    return { productId, batchNumber, quantityCurrent, quantityInitial, expiryDate, productionDate, location, shelf, warehouse, notes, status };
  }

  // Unlike the base pattern, this endpoint takes pharmacyId as a query param
  // on create too (not just update/delete/getAll).
  @CastResponse(undefined, { fallback: '$default', unwrap: 'data' })
  override create(model: StockBatchModel): Observable<StockBatchModel> {
    return this.http.post<StockBatchModel>(this.getCreateEndpoint(), this.toRequestPayload(model), {
      params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
    });
  }

  getProducts(): Observable<Product[]> {
    return this.http
      .get<ApiResponse<Product[]>>(`${environment.apiUrl}/products`, {
        params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
      })
      .pipe(map((res) => res.data ?? []));
  }
}
