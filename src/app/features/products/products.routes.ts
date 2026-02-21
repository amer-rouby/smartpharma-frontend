import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';  // ✅ الصحيح
import { ProductFormComponent } from './product-form/product-form.component';  // ✅ الصحيح
import { ProductCategoriesComponent } from './product-categories/product-categories.component';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductListComponent
  },
  {
    path: 'new',
    component: ProductFormComponent
  },
  {
    path: 'edit/:id',
    component: ProductFormComponent
  },
  {
    path: 'categories',
    component: ProductCategoriesComponent
  }
];
