import { Injectable, Type } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CastResponse, CastResponseContainer } from 'cast-response';
import { CrudWithDialogService, PagedResult, RegisterServiceMixin } from '../../../core/crud';
import { environment } from '../../../../environments/environment';
import { ProductModel } from '../models/product.model';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';

// Parallel to ProductService, which other screens still use for lookups.
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

  // create also needs pharmacyId as a query param, unlike the base pattern.
  @CastResponse(undefined, { fallback: '$default', unwrap: 'data' })
  override create(model: ProductModel): Observable<ProductModel> {
    return this.http.post<ProductModel>(this.getCreateEndpoint(), this.toRequestPayload(model), {
      params: new HttpParams().set('pharmacyId', this.getPharmacyId()),
    });
  }
}
