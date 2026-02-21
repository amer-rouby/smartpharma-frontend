import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    PageHeaderComponent,
    RouterLink
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  reportCards = [
    { title: 'تقارير المبيعات', icon: 'trending_up', route: '/reports/sales', color: '#667eea' },
    { title: 'تقارير المخزون', icon: 'inventory', route: '/reports/stock', color: '#764ba2' },
    { title: 'التقارير المالية', icon: 'account_balance', route: '/reports/financial', color: '#f093fb' },
    { title: 'تقارير المنتجات', icon: 'assessment', route: '/reports/products', color: '#f5576c' }
  ];

  constructor() { }
}
