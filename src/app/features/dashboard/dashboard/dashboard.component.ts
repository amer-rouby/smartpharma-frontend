// src/app/features/dashboard/dashboard.component.ts

import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { DashboardService, DashboardStats, TopProduct, RecentSale } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MaterialModule,
    MatSnackBarModule,
    PageHeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly snackBar = inject(MatSnackBar);

  // ✅ Signals for state management
  readonly stats = signal<DashboardStats | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string>('');

  // ✅ Computed values for template
  readonly hasError = computed(() => this.error().length > 0 && !this.loading());
  readonly showStats = computed(() => !this.loading() && this.error().length === 0 && this.stats() !== null);
  readonly hasTopProducts = computed(() => this.showStats() && (this.stats()?.topProducts?.length ?? 0) > 0);
  readonly hasRecentSales = computed(() => this.showStats() && (this.stats()?.recentSales?.length ?? 0) > 0);
  private readonly router = inject(Router);
  // ✅ Table columns
  readonly topProductsColumns = ['rank', 'productName', 'quantitySold', 'totalRevenue'];
  readonly recentSalesColumns = ['invoiceNumber', 'totalAmount', 'transactionDate', 'paymentMethod'];

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ Load dashboard data from backend
  loadDashboardStats(): void {
    this.loading.set(true);
    this.error.set('');

    this.dashboardService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading dashboard:', err);
          this.error.set(this.getErrorMessage(err));
          this.loading.set(false);
          this.snackBar.open(this.error(), 'إغلاق', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  // ✅ Refresh data manually
  refreshData(): void {
    this.loadDashboardStats();
    this.snackBar.open('جاري تحديث البيانات...', 'إغلاق', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  // ✅ Format currency in EGP
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // ✅ Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ✅ Get payment method in Arabic
  getPaymentMethodArabic(method: string): string {
    const methods: Record<string, string> = {
      'CASH': 'نقدي',
      'VISA': 'بطاقة ائتمان',
      'INSTAPAY': 'إنستا باي',
      'WALLET': 'محفظة إلكترونية',
      'CREDIT': 'آجل'
    };
    return methods[method] || method;
  }

  // ✅ Get payment chip color
  getPaymentChipColor(method: string): 'primary' | 'accent' | 'warn' {
    const colors: Record<string, 'primary' | 'accent' | 'warn'> = {
      'CASH': 'primary',
      'VISA': 'accent',
      'INSTAPAY': 'accent',
      'WALLET': 'primary',
      'CREDIT': 'warn'
    };
    return colors[method] || 'primary';
  }

  // ✅ Get stat card color by index
  getStatColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    ];
    return colors[index] ?? colors[0];
  }

  // ✅ Navigate to low stock products
  viewLowStockProducts(): void {
    this.snackBar.open('جاري الانتقال إلى تنبيهات المخزون...', 'إغلاق', { duration: 2000 });
  }

  // ✅ Navigate to all sales
  viewAllSales(): void {
    this.router.navigate(['/sales/history']);
  }

  // ✅ Get error message in Arabic
  private getErrorMessage(error: any): string {
    if (error?.status === 0) {
      return 'تعذر الاتصال بالخادم، تأكد من تشغيل الـ Backend';
    }
    if (error?.status === 401) {
      return 'غير مصرح لك، يرجى تسجيل الدخول';
    }
    if (error?.status === 403) {
      return 'ليس لديك صلاحيات لعرض هذه البيانات';
    }
    if (error?.status === 404) {
      return 'البيانات غير موجودة';
    }
    return 'فشل تحميل بيانات لوحة التحكم، يرجى المحاولة لاحقاً';
  }
}
