import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES)
      },
      {
        path: 'stock',
        loadComponent: () => import('./features/stock/stock-management/stock-management.component').then(m => m.StockManagementComponent)
      },
      {
        path: 'stock',
        loadComponent: () => import('./features/stock/stock-management/stock-management.component')
          .then(m => m.StockManagementComponent)
      },
      {
        path: 'stock/add-batch',
        loadComponent: () => import('./features/stock/stock-batch-form/stock-batch-form.component')
          .then(m => m.StockBatchFormComponent)
      },
      {
        path: 'stock/batches/:id/edit',
        loadComponent: () => import('./features/stock/stock-batch-form/stock-batch-form.component')
          .then(m => m.StockBatchFormComponent)
      },
      {
        path: 'sales',
        loadChildren: () => import('./features/sales/sales.routes').then(m => m.SALES_ROUTES)
      },
      {
        path: 'expenses',
        loadChildren: () => import('./features/expenses/expenses.routes').then(m => m.expensesRoutes)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notification-bell/notifications.component').then(m => m.NotificationsComponent),
        title: 'التنبيهات - صيدليتي الذكية'
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
