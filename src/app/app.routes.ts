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
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    // ✅ Main Layout - كل الـ routes الجاية هتظهر مع Sidebar/Navbar
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes')
          .then(m => m.PRODUCTS_ROUTES)
      },
      {
        path: 'stock',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/stock/stock-management/stock-management.component')
              .then(m => m.StockManagementComponent)
          },
          {
            path: 'alerts',
            loadComponent: () => import('./features/stock/stock-alerts/stock-alerts.component')
              .then(m => m.StockAlertsComponent)
          },
          {
            path: 'add-batch',
            loadComponent: () => import('./features/stock/stock-batch-form/stock-batch-form.component')
              .then(m => m.StockBatchFormComponent)
          },
          {
            path: 'batches/:id/edit',
            loadComponent: () => import('./features/stock/stock-batch-form/stock-batch-form.component')
              .then(m => m.StockBatchFormComponent)
          },
          {
            path: 'history',
            loadComponent: () => import('./features/stock/stock-movements/stock-movements.component')
              .then(m => m.StockMovementsComponent)
          }
        ]
      },
      {
        path: 'sales',
        loadChildren: () => import('./features/sales/sales.routes')
          .then(m => m.SALES_ROUTES)
      },
      {
        path: 'expenses',
        loadChildren: () => import('./features/expenses/expenses.routes')
          .then(m => m.expensesRoutes)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes')
          .then(m => m.REPORTS_ROUTES)
      },
      {
        // ✅ Settings داخل الـ Main Layout
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes')
          .then(m => m.SETTINGS_ROUTES)
      },
      {
        // ✅ Users داخل الـ Main Layout
        path: 'users',
        loadChildren: () => import('./features/users/users.routes')
          .then(m => m.USERS_ROUTES)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notification-bell/notifications.component')
          .then(m => m.NotificationsComponent),
        title: 'التنبيهات - صيدليتي الذكية'
      },
      {
        path: 'help',
        loadComponent: () => import('./features/help/help.component')
          .then(m => m.HelpComponent),
        canActivate: [authGuard],
        title: 'HELP.TITLE'
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
