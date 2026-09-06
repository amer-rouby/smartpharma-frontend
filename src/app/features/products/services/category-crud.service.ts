import { Injectable, Type } from '@angular/core';
import { CastResponseContainer } from 'cast-response';
import { CrudWithDialogService, PagedResult, RegisterServiceMixin } from '../../../core/crud';
import { environment } from '../../../../environments/environment';
import { CategoryModel } from '../models/category.model';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';

// Parallel to the pre-existing CategoryService (core/services/category.service.ts),
// which other screens (product form, dashboard) still use for lookups/search.
// This one only backs the Categories CRUD screen (list/add/edit/delete/toggle),
// built on the follow-up-style CrudModel/CrudService architecture.
@CastResponseContainer({
  $default: {
    model: () => CategoryModel,
    unwrap: 'data',
  },
  $pagination: {
    model: () => PagedResult,
    unwrap: 'data',
    shape: {
      'content.*': () => CategoryModel,
    },
  },
})
@Injectable({ providedIn: 'root' })
export class CategoryCrudService extends RegisterServiceMixin(CrudWithDialogService)<CategoryModel, CategoryDialogComponent, number> {
  $$serviceName = 'CategoryCrudService';

  override getSegmentUrl(): string {
    return `${environment.apiUrl}/categories`;
  }

  override getGetAllEndpoint(): string {
    return `${this.getSegmentUrl()}/page`;
  }

  override getDialogComponent(): Type<CategoryDialogComponent> {
    return CategoryDialogComponent;
  }

  override getModelInstance(): CategoryModel {
    const model = new CategoryModel();
    model.pharmacyId = this.getPharmacyId();
    return model;
  }
}
