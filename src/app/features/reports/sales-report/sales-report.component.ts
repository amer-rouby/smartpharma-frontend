import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartDataset } from 'chart.js';
import { ReportService  } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReportRequest, SalesReportData } from '../../../core/models/Report.model';

interface DailySalesRow {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProductRow {
  rank: number;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MaterialModule,
    PageHeaderComponent,
    BaseChartDirective
  ],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss'
})
export class SalesReportComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly startDate = signal<string>(this.formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1))));
  readonly endDate = signal<string>(this.formatDate(new Date()));
  readonly reportType = signal<'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'>('MONTHLY');
  readonly salesReportData = signal<SalesReportData | null>(null);
  readonly reportLoading = signal(false);
  readonly reportError = signal<string>('');
  readonly dailySalesTableData = signal<DailySalesRow[]>([]);
  readonly topProductsTableData = signal<TopProductRow[]>([]);
  readonly dailySalesColumns = ['date', 'revenue', 'orders'];
  readonly topProductsColumns = ['rank', 'productName', 'quantitySold', 'totalRevenue'];
  readonly activeTable = signal<'daily' | 'products'>('daily');
  readonly lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'المبيعات',
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        tension: 0.4,
        fill: true
      }
    ] as ChartDataset<'line'>[]
  };

  readonly lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };

  readonly pieChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#ef4444']
      }
    ] as ChartDataset<'doughnut'>[]
  };

  readonly pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };

  ngOnInit(): void {
    this.generateReport();
  }

  generateReport(): void {
    this.reportLoading.set(true);
    this.reportError.set('');

    const request: ReportRequest = {
      pharmacyId: this.getPharmacyId(),
      startDate: this.startDate(),
      endDate: this.endDate(),
      reportType: this.reportType()
    };

    this.reportService.getSalesReport(request).subscribe({
      next: (data) => {
        this.salesReportData.set(data);
        this.updateTables(data);
        this.updateCharts(data);
        this.reportLoading.set(false);
      },
      error: (error) => {
        this.reportError.set('REPORTS.LOAD_ERROR');
        this.reportLoading.set(false);
        this.snackBar.open(this.translateIfNeeded('REPORTS.LOAD_ERROR'), this.translateIfNeeded('COMMON.CLOSE'), { duration: 3000 });
        console.error('Report error:', error);
      }
    });
  }

  private updateTables(data: SalesReportData): void {
    if (data.dailySales?.length) {
      const dailyRows: DailySalesRow[] = data.dailySales.map(sale => ({
        date: sale.date,
        revenue: sale.revenue,
        orders: sale.orders
      }));
      this.dailySalesTableData.set(dailyRows);
    }

    if (data.topProducts?.length) {
      const productRows: TopProductRow[] = data.topProducts.map((product, index) => ({
        rank: index + 1,
        productName: product.productName,
        quantitySold: product.quantitySold,
        totalRevenue: product.totalRevenue
      }));
      this.topProductsTableData.set(productRows);
    }
  }

  private updateCharts(data: SalesReportData): void {
    if (data.dailySales?.length) {
      this.lineChartData.labels = data.dailySales.map(d => d.date);
      this.lineChartData.datasets[0].data = data.dailySales.map(d => d.revenue);
    }

    if (data.revenueByPaymentMethod && Object.keys(data.revenueByPaymentMethod).length > 0) {
      this.pieChartData.labels = Object.keys(data.revenueByPaymentMethod).map(key =>
        this.getPaymentMethodLabel(key)
      );
      this.pieChartData.datasets[0].data = Object.values(data.revenueByPaymentMethod);
    }
  }

  setActiveTable(tab: 'daily' | 'products'): void {
    this.activeTable.set(tab);
  }

  exportPDF(): void {
    this.snackBar.open(this.translateIfNeeded('REPORTS.EXPORTING_PDF'), this.translateIfNeeded('COMMON.CLOSE'), { duration: 2000 });
  }

  exportExcel(): void {
    this.snackBar.open(this.translateIfNeeded('REPORTS.EXPORTING_EXCEL'), this.translateIfNeeded('COMMON.CLOSE'), { duration: 2000 });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getPaymentMethodLabel(method: string): string {
    const methods: Record<string, string> = {
      'CASH': 'SALES.CASH',
      'VISA': 'SALES.VISA',
      'INSTAPAY': 'SALES.INSTAPAY',
      'WALLET': 'SALES.WALLET',
      'CREDIT': 'SALES.CREDIT'
    };
    return methods[method] || method;
  }

  private translateIfNeeded(key: string): string {
    const translations: Record<string, string> = {
      'COMMON.CLOSE': 'إغلاق',
      'REPORTS.LOAD_ERROR': 'فشل تحميل التقرير',
      'REPORTS.EXPORTING_PDF': 'جاري تصدير PDF...',
      'REPORTS.EXPORTING_EXCEL': 'جاري تصدير Excel...',
      'SALES.CASH': 'نقدي',
      'SALES.VISA': 'بطاقة',
      'SALES.INSTAPAY': 'إنستا باي',
      'SALES.WALLET': 'محفظة',
      'SALES.CREDIT': 'آجل'
    };
    return translations[key] || key;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }
}
