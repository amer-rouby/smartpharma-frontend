import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SalesService } from '../../../core/services/sales.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ExportService } from '../../../core/services/export.service';
import { CategorySales, ProductSales, SalesAnalytics, SalesAnalyticsParams } from '../../../core/models/sale.model';
import { MaterialModule } from '../../../shared/material.module';
import { FilterState, PeriodType, StatCard } from '../../../core/models';
import { environment } from '../../../../environments/environment';

declare global {
  interface Window {
    __exportIframe?: HTMLIFrameElement;
  }
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
  private readonly translate = inject(TranslateService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly exportService = inject(ExportService);
  private readonly http = inject(HttpClient);
  private readonly destroy$ = new Subject<void>();

  // ✅ إضافة currentLang signal
  readonly currentLang = signal<string>(this.translate.currentLang || 'ar');

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
    this.setupLanguageSubscription();
  }

  // ✅ دالة لمتابعة تغيير اللغة
  private setupLanguageSubscription(): void {
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(event => {
      this.currentLang.set(event.lang);
    });
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
        this.state.update(s => ({
          ...s,
          loading: false,
          error: 'REPORTS.LOAD_ERROR'
        }));
        this.errorHandler.handleHttpError(err, 'REPORTS.LOAD_ERROR');
      }
    });
  }

  onFilterChange(): void {
    this.loadData();
  }

  onRefresh(): void {
    this.setDefaultDates();
    this.loadData();
    this.errorHandler.showSuccess('REPORTS.REFRESH_SUCCESS');
  }

  onExport(format: 'excel' | 'pdf'): void {
    const pharmacyId = this.state().pharmacyId;
    const { startDate, endDate } = this.filters();

    if (!startDate || !endDate) {
      this.errorHandler.showWarning('REPORTS.EXPORT_NO_DATE_RANGE');
      return;
    }

    const endpoint = format === 'excel' ? '/sales/excel' : '/sales/pdf';
    const fileName = `sales_report_${startDate}_to_${endDate}.${format}`;

    // Remove existing iframe if present
    if (window.__exportIframe) {
      window.__exportIframe.remove();
    }

    // Create iframe that covers the entire screen (visible for printing)
    const iframe = document.createElement('iframe');
    iframe.id = 'export-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.zIndex = '9999';
    iframe.style.backgroundColor = 'white';
    iframe.style.display = 'block';
    iframe.style.visibility = 'visible';
    iframe.style.opacity = '1';
    document.body.appendChild(iframe);
    window.__exportIframe = iframe;

    // Build URL with params
    const baseUrl = `${environment.apiUrl}/reports/export${endpoint}`;
    let params = new HttpParams()
      .set('pharmacyId', pharmacyId.toString())
      .set('startDate', startDate)
      .set('endDate', endDate);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/octet-stream'
    });

    // Fetch the blob
    this.http.get(baseUrl, { headers, params, responseType: 'blob' }).subscribe({
      next: (blob) => {
        // Create blob URL
        const blobURL = URL.createObjectURL(blob);

        // Set iframe src directly to blob URL
        iframe.src = blobURL;

        // Wait for iframe to load completely
        iframe.onload = () => {
          // Wait for content to render
          setTimeout(() => {
            try {
              // Trigger print dialog
              iframe.contentWindow?.print();
            } catch (error) {
              console.error('Print failed:', error);
            }

            // Clean up after printing
            setTimeout(() => {
              URL.revokeObjectURL(blobURL);
              if (iframe.parentNode) {
                iframe.remove();
              }
            }, 2000);
          }, 1500);
        };

        // Fallback if onload doesn't fire
        setTimeout(() => {
          try {
            iframe.contentWindow?.print();
          } catch (error) {
            console.error('Print failed:', error);
          }
          setTimeout(() => {
            URL.revokeObjectURL(blobURL);
            if (iframe.parentNode) {
              iframe.remove();
            }
          }, 2000);
        }, 4000);
      },
      error: (err) => {
        this.errorHandler.handleHttpError(err, 'REPORTS.EXPORT_ERROR');
        if (iframe.parentNode) {
          iframe.remove();
        }
      }
    });
  }

  calculateBarHeight(value: number): number {
    const data = this.trendData();
    if (!data?.length) return 10;
    const max = Math.max(...data.map(d => d.revenue));
    return max > 0 ? Math.max(10, (value / max) * 100) : 10;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat(this.currentLang() === 'ar' ? 'ar-EG' : 'en-US', {
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
