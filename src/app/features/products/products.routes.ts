import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },
  {
    path: 'quick-add',
    loadComponent: () => import('./quick-add-scan/quick-add-scan.component')
      .then(m => m.QuickAddScanComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./product-categories/product-categories.component')
      .then(m => m.ProductCategoriesComponent)
  }
];
