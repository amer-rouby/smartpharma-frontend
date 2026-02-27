import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const STOCK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./stock-management/stock-management.component')
      .then(m => m.StockManagementComponent),
    canActivate: [authGuard]
  },
  {
    path: 'alerts',  // ✅ أضف الروت ده
    loadComponent: () => import('./stock-alerts/stock-alerts.component')
      .then(m => m.StockAlertsComponent),
    canActivate: [authGuard]
  },
  // {
  //   path: 'batches',
  //   loadComponent: () => import('./stock-batches/stock-batches.component')
  //     .then(m => m.StockBatchesComponent),
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'history',
  //   loadComponent: () => import('./stock-history/stock-history.component')
  //     .then(m => m.StockHistoryComponent),
  //   canActivate: [authGuard]
  // }
];
