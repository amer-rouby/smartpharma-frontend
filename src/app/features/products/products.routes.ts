import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./product-form/product-form.component')
      .then(m => m.ProductFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./product-form/product-form.component')
      .then(m => m.ProductFormComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./product-categories/product-categories.component')
      .then(m => m.ProductCategoriesComponent)
  }
];
