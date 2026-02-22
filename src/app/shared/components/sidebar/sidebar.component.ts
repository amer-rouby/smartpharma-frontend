import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialModule } from '../../material.module';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  children?: MenuItem[];
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MaterialModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  // ✅ Angular 21+: Signal Input
  readonly isCollapsed = input<boolean>(false);

  // ✅ Menu Items
  readonly menuItems: MenuItem[] = [
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

  // ✅ Track expanded panels
  readonly expandedPanels = signal<Set<number>>(new Set());

  hasAccess(roles?: string[]): boolean {
    if (!roles) return true;
    const userRole = localStorage.getItem('userRole');
    return userRole ? roles.includes(userRole) : false;
  }

  togglePanel(index: number): void {
    this.expandedPanels.update(panels => {
      const newPanels = new Set(panels);
      if (newPanels.has(index)) {
        newPanels.delete(index);
      } else {
        newPanels.add(index);
      }
      return newPanels;
    });
  }

  isExpanded(index: number): boolean {
    return this.expandedPanels().has(index);
  }
}
