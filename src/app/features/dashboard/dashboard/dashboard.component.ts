import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { DashboardService } from '../../../core/services/dashboard.service';
import { LanguageService } from '../../../core/services/language.service';
import { DashboardStats } from '../../../core/models/dashboard.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MaterialModule, MatSnackBarModule, PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroy$ = new Subject<void>();

  readonly stats = signal<DashboardStats | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly hasError = computed(() => this.error().length > 0 && !this.loading());
  readonly showStats = computed(() => !this.loading() && !this.error() && !!this.stats());
  readonly hasTopProducts = computed(() => this.showStats() && (this.stats()?.topProducts?.length ?? 0) > 0);
  readonly hasRecentSales = computed(() => this.showStats() && (this.stats()?.recentSales?.length ?? 0) > 0);

  readonly topProductsColumns = ['rank', 'productName', 'quantitySold', 'totalRevenue'];
  readonly recentSalesColumns = ['invoiceNumber', 'totalAmount', 'transactionDate', 'paymentMethod'];

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
          this.error.set('DASHBOARD.LOAD_ERROR');
          this.loading.set(false);
          this.errorHandler.handleHttpError(err, 'DASHBOARD.LOAD_ERROR');
        }
      });
  }

  refreshData(): void {
    this.loadDashboardStats();
    this.errorHandler.showSuccess('DASHBOARD.REFRESH_SUCCESS');
  }

  formatCurrency(amount: number): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPaymentMethodArabic(method: string): string {
    const methods: Record<string, string> = {
      'CASH': this.translate.instant('SALES.CASH'),
      'VISA': this.translate.instant('SALES.VISA'),
      'INSTAPAY': this.translate.instant('SALES.INSTAPAY'),
      'WALLET': this.translate.instant('SALES.WALLET'),
      'CREDIT': this.translate.instant('SALES.CREDIT')
    };
    return methods[method] || method;
  }

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

  getStatColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    ];
    return colors[index] ?? colors[0];
  }

  viewLowStockProducts(): void {
    this.errorHandler.showWarning('DASHBOARD.STOCK_ALERTS_BTN');
  }

  viewAllSales(): void {
    this.router.navigate(['/sales/history']);
  }
}
