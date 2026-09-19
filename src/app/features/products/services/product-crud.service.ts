import { Injectable, Type } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CastResponse, CastResponseContainer } from 'cast-response';
import { CrudWithDialogService, PagedResult, RegisterServiceMixin } from '../../../core/crud';
import { environment } from '../../../../environments/environment';
import { ProductModel } from '../models/product.model';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';

// Parallel to the pre-existing ProductService (core/services/product.service.ts),
// which sales-form/purchase-form/quick-add-scan still use for lookups (barcode
// search, low-stock, etc.). This one only backs the Products CRUD screen
// (list/add/edit/delete), built on the CrudModel/CrudService architecture.
@CastResponseContainer({
  $default: {
    model: () => ProductModel,
  },
  $pagination: {
    model: () => PagedResult,
    shape: {
      'content.*': () => ProductModel,
    },
  },
})
@Injectable({ providedIn: 'root' })
export class ProductCrudService extends RegisterServiceMixin(CrudWithDialogService)<ProductModel, ProductDialogComponent, number> {
  $$serviceName = 'ProductCrudService';

  override getSegmentUrl(): string {
    return `${environment.apiUrl}/products`;
  }

  override getDialogComponent(): Type<ProductDialogComponent> {
    return ProductDialogComponent;
  }

  override getModelInstance(): ProductModel {
    return new ProductModel();
  }

  // ProductRequest has no id/pharmacyId/totalStock/createdAt/updatedAt.
  override toRequestPayload(model: ProductModel): unknown {
    const { name, scientificName, barcode, category, unitType, minStockLevel, prescriptionRequired, sellPrice, buyPrice, extraAttributes, initialStock, expiryDate } = model;
    return { name, scientificName, barcode, category, unitType, minStockLevel, prescriptionRequired, sellPrice, buyPrice, extraAttributes, initialStock, expiryDate };
  }

  // Unlike the base pattern, this endpoint takes pharmacyId as a query param
  // on create too (not just update/delete/getAll).
  @CastResponse(undefined, { fallback: '$default', unwrap: 'data' })
  override create(model: ProductModel): Observable<ProductModel> {
    return this.http.post<ProductModel>(this.getCreateEndpoint(), this.toRequestPayload(model), {
      params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
    });
  }
}
