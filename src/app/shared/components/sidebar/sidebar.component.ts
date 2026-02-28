import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

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
    MaterialModule,
    TranslateModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly isCollapsed = input<boolean>(false);

  readonly menuItems: MenuItem[] = [
    {
      icon: 'dashboard',
      label: 'NAV.DASHBOARD',
      route: '/dashboard',
      roles: ['ADMIN', 'PHARMACIST', 'MANAGER', 'VIEWER']
    },
    {
      icon: 'inventory_2',
      label: 'NAV.PRODUCTS',
      children: [
        { icon: 'list', label: 'NAV.PRODUCTS_ALL', route: '/products' },
        { icon: 'add', label: 'NAV.PRODUCTS_ADD', route: '/products/new' },
        { icon: 'category', label: 'NAV.PRODUCTS_CATEGORIES', route: '/products/categories' }
      ],
      roles: ['ADMIN', 'PHARMACIST', 'MANAGER']
    },
    {
      icon: 'storage',
      label: 'NAV.STOCK',
      children: [
        { icon: 'inventory', label: 'NAV.STOCK_MANAGE', route: '/stock' },
        { icon: 'warning', label: 'NAV.STOCK_ALERTS', route: '/stock/alerts' },
        { icon: 'history', label: 'NAV.STOCK_HISTORY', route: '/stock/history' },
        { icon: 'event_busy', label: 'NAV.EXPIRY_REPORT', route: '/reports/expiry' }
      ],
      roles: ['ADMIN', 'PHARMACIST', 'MANAGER']
    },
    {
      icon: 'shopping_cart',
      label: 'NAV.SALES',
      children: [
        { icon: 'point_of_sale', label: 'NAV.SALES_POS', route: '/sales/pos' },
        { icon: 'receipt_long', label: 'NAV.SALES_HISTORY', route: '/sales/history' },
        { icon: 'analytics', label: 'NAV.SALES_ANALYTICS', route: '/sales/analytics' }
      ],
      roles: ['ADMIN', 'PHARMACIST', 'MANAGER']
    },
    {
      icon: 'assessment',
      label: 'NAV.REPORTS',
      children: [
        { icon: 'trending_up', label: 'NAV.REPORTS_SALES', route: '/reports/sales' },
        { icon: 'pie_chart', label: 'NAV.REPORTS_STOCK', route: '/reports/stock' },
        { icon: 'account_balance', label: 'NAV.REPORTS_FINANCIAL', route: '/reports/financial' },
        { icon: 'event_busy', label: 'NAV.REPORTS_EXPIRY', route: '/reports/expiry' }
      ],
      roles: ['ADMIN', 'MANAGER']
    },
    {
      icon: 'payments',
      label: 'NAV.EXPENSES',
      route: '/expenses',
      roles: ['ADMIN', 'MANAGER']
    },
    {
      icon: 'people',
      label: 'NAV.USERS',
      route: '/settings/users',
      roles: ['ADMIN']
    },
    {
      icon: 'settings',
      label: 'NAV.SETTINGS',
      route: '/settings',
      roles: ['ADMIN', 'MANAGER']
    }
  ];

  readonly expandedPanels = signal<Set<number>>(new Set());

  hasAccess(roles?: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      console.warn('No currentUser found in localStorage!');
      return false;
    }
    try {
      const currentUser = JSON.parse(currentUserStr);
      const userRole = currentUser?.role;
      if (!userRole) {
        console.warn('No role found in currentUser!');
        return false;
      }
      const hasAccess = roles.includes(userRole);
      return hasAccess;
    } catch (error) {
      console.error('Error parsing currentUser:', error);
      return false;
    }
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
