
import { Routes } from '@angular/router';
import { SalesFormComponent } from './sales-form/sales-form.component';
import { SalesHistoryComponent } from './sales-history/sales-history.component';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'pos',
    pathMatch: 'full'
  },
  {
    path: 'pos',  // ✅ استخدم SalesFormComponent بس
    component: SalesFormComponent,
    title: 'نقطة البيع | صيدليتي الذكية'
  },
  {
    path: 'history',
    component: SalesHistoryComponent,
    title: 'سجل المبيعات | صيدليتي الذكية'
  }
];
