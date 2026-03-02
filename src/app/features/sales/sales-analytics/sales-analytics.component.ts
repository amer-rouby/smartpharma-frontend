import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { SalesService } from '../../../core/services/sales.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategorySales, ProductSales, SalesAnalytics, SalesAnalyticsParams } from '../../../core/models/sale.model';
import { MaterialModule } from '../../../shared/material.module';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface FilterState {
  period: PeriodType;
  startDate: string;
  endDate: string;
}

interface StatCard {
  key: string;
  label: string;
  icon: string;
  class: string;
  showMargin?: boolean;
}

@Component({
  selector: 'app-sales-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MaterialModule],
  templateUrl: './sales-analytics.component.html',
  styleUrl: './sales-analytics.component.scss'
})
export class SalesAnalyticsComponent implements OnInit, OnDestroy {
  private readonly salesService = inject(SalesService);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  readonly state = signal<{
    analytics: SalesAnalytics | null;
    topProducts: ProductSales[];
    categorySales: CategorySales[];
    loading: boolean;
    error: string | null;
    pharmacyId: number;
  }>({
    analytics: null,
    topProducts: [],
    categorySales: [],
    loading: false,
    error: null,
    pharmacyId: 1
  });

  readonly filters = signal<FilterState>({
    period: 'monthly',
    startDate: '',
    endDate: ''
  });

  readonly statsCards: StatCard[] = [
    { key: 'totalRevenue', label: 'REPORTS.TOTAL_REVENUE', icon: 'attach_money', class: 'revenue' },
    { key: 'totalSales', label: 'REPORTS.TOTAL_SALES', icon: 'receipt_long', class: 'sales' },
    { key: 'averageOrderValue', label: 'REPORTS.AVERAGE_ORDER', icon: 'shopping_cart', class: 'average' },
    { key: 'profit', label: 'REPORTS.PROFIT', icon: 'account_balance_wallet', class: 'profit', showMargin: true }
  ];

  readonly hasData = computed(() => !this.state().loading && !!this.state().analytics);
  readonly hasTopProducts = computed(() => this.state().topProducts.length > 0);
  readonly hasCategorySales = computed(() => this.state().categorySales.length > 0);
  readonly trendData = computed(() => this.state().analytics?.trendData ?? []);
  readonly analytics = computed(() => this.state().analytics);

  readonly periods: { value: PeriodType; label: string }[] = [
    { value: 'daily', label: 'REPORTS.DAILY' },
    { value: 'weekly', label: 'REPORTS.WEEKLY' },
    { value: 'monthly', label: 'REPORTS.MONTHLY' },
    { value: 'yearly', label: 'REPORTS.YEARLY' }
  ];

  ngOnInit(): void {
    this.initialize();
  }

  private initialize(): void {
    this.setPharmacyId();
    this.setDefaultDates();
    this.loadData();
  }

  private setPharmacyId(): void {
    const id = this.authService.getPharmacyId() ?? 1;
    this.state.update(s => ({ ...s, pharmacyId: id }));
  }

  private setDefaultDates(): void {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    this.filters.update(f => ({
      ...f,
      startDate: first.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    }));
  }

  private loadData(): void {
    if (this.state().pharmacyId <= 0) return;

    this.state.update(s => ({ ...s, loading: true, error: null }));

    const params: SalesAnalyticsParams = {
      pharmacyId: this.state().pharmacyId,
      ...this.filters()
    };

    const analytics$ = this.salesService.getSalesAnalytics(params);
    const topProducts$ = this.salesService.getTopSellingProducts(this.state().pharmacyId);
    const categorySales$ = this.salesService.getSalesByCategory(
      this.state().pharmacyId,
      this.filters().startDate,
      this.filters().endDate
    );

    forkJoin({
      analytics: analytics$,
      topProducts: topProducts$,
      categorySales: categorySales$
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: results => {
        this.state.update(s => ({
          ...s,
          analytics: results.analytics,
          topProducts: results.topProducts,
          categorySales: results.categorySales,
          loading: false,
          error: null
        }));
      },
      error: err => {
        console.error('Error loading analytics:', err);
        this.state.update(s => ({
          ...s,
          loading: false,
          error: err?.message || 'ERRORS.LOAD_FAILED'
        }));
      }
    });
  }

  onFilterChange(): void {
    this.loadData();
  }

  onRefresh(): void {
    this.setDefaultDates();
    this.loadData();
  }

  onExport(format: 'excel' | 'pdf'): void {
    console.log(`Exporting as ${format}...`);
  }

  calculateBarHeight(value: number): number {
    const data = this.trendData();
    if (!data?.length) return 10;
    const max = Math.max(...data.map(d => d.revenue));
    return max > 0 ? Math.max(10, (value / max) * 100) : 10;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatValue(key: string): string {
    const analytics = this.state().analytics;
    if (!analytics) return '-';
    switch (key) {
      case 'totalRevenue':
      case 'averageOrderValue':
      case 'profit':
        return this.formatCurrency(analytics[key as keyof SalesAnalytics] as number);
      case 'totalSales':
        return (analytics[key as keyof SalesAnalytics] as number)?.toString() ?? '0';
      default:
        return '-';
    }
  }

  getProfitClass(margin?: number): string {
    if (margin === undefined) return '';
    return margin >= 0 ? 'positive' : 'negative';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
