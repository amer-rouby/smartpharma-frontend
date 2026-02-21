import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialModule } from '../../material.module';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MaterialModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  menuItems: MenuItem[] = [
    {
      icon: 'dashboard',
      label: 'لوحة التحكم',
      route: '/dashboard',
      roles: ['ADMIN', 'PHARMACIST', 'MANAGER', 'VIEWER']
    },
    {
      icon: 'inventory_2',
      label: 'المنتجات',
      children: [
        { icon: 'list', label: 'جميع المنتجات', route: '/products' },
        { icon: 'add', label: 'إضافة منتج', route: '/products/new' },
        { icon: 'category', label: 'التصنيفات', route: '/products/categories' }
      ],
      roles: ['ADMIN', 'PHARMACIST', 'MANAGER']
    },
    {
      icon: 'storage',
      label: 'المخزون',
      children: [
        { icon: 'inventory', label: 'إدارة المخزون', route: '/stock' },
        { icon: 'warning', label: 'تنبيهات المخزون', route: '/stock/alerts' },
        { icon: 'history', label: 'سجل الحركات', route: '/stock/history' }
      ],
      roles: ['ADMIN', 'PHARMACIST', 'MANAGER']
    },
    {
      icon: 'shopping_cart',
      label: 'المبيعات',
      children: [
        { icon: 'point_of_sale', label: 'نقطة البيع', route: '/sales/pos' },
        { icon: 'receipt_long', label: 'سجل المبيعات', route: '/sales/history' },
        { icon: 'analytics', label: 'تحليل المبيعات', route: '/sales/analytics' }
      ],
      roles: ['ADMIN', 'PHARMACIST', 'MANAGER']
    },
    {
      icon: 'assessment',
      label: 'التقارير',
      children: [
        { icon: 'trending_up', label: 'تقارير المبيعات', route: '/reports/sales' },
        { icon: 'pie_chart', label: 'تقارير المخزون', route: '/reports/stock' },
        { icon: 'account_balance', label: 'التقارير المالية', route: '/reports/financial' }
      ],
      roles: ['ADMIN', 'MANAGER']
    },
    {
      icon: 'people',
      label: 'المستخدمين',
      route: '/settings/users',
      roles: ['ADMIN']
    },
    {
      icon: 'settings',
      label: 'الإعدادات',
      route: '/settings',
      roles: ['ADMIN', 'MANAGER']
    }
  ];

  constructor() { }

  hasAccess(roles?: string[]): boolean {
    if (!roles) return true;
    const userRole = localStorage.getItem('userRole');
    return userRole ? roles.includes(userRole) : false;
  }

  trackByFn(index: number, item: MenuItem): string {
    return item.label;
  }
}
