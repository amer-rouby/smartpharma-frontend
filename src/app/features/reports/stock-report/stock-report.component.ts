import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartDataset } from 'chart.js';
import { ReportService, ReportRequest, StockReportData } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';

interface StockCategoryRow {
  categoryName: string;
  itemCount: number;
  totalValue: number;
}

interface LowStockRow {
  productId: number;
  productName: string;
  batchNumber: string;
  currentStock: number;
  minStock: number;
  expiryDate?: string;
  progress: number;
}

interface ExpiringRow {
  productId: number;
  productName: string;
  batchNumber: string;
  currentStock: number;
  expiryDate: string;
  daysUntilExpiry: number;
  status: 'urgent' | 'warning' | 'ok';
}

@Component({
  selector: 'app-stock-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MaterialModule,
    PageHeaderComponent,
    BaseChartDirective
  ],
  templateUrl: './stock-report.component.html',
  styleUrl: './stock-report.component.scss'
})
export class StockReportComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  // ✅ Date signals - استخدم الأنواع المتوافقة مع ReportRequest
  readonly reportType = signal<'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'>('CUSTOM');

  // ✅ Report data signals
  readonly stockReportData = signal<StockReportData | null>(null);
  readonly reportLoading = signal(false);
  readonly reportError = signal<string>('');

  // ✅ Table data
  readonly categoryTableData = signal<StockCategoryRow[]>([]);
  readonly lowStockTableData = signal<LowStockRow[]>([]);
  readonly expiringTableData = signal<ExpiringRow[]>([]);

  // ✅ Active table tab
  readonly activeTable = signal<'categories' | 'low-stock' | 'expiring'>('categories');

  // ✅ Chart data - FIXED: Added 'data:' property properly
  readonly barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],  // ✅ FIXED: Added 'data:' property with colon
        label: 'القيمة',
        backgroundColor: '#667eea',
        borderColor: '#556cd6',
        borderWidth: 1
      }
    ] as ChartDataset<'bar'>[]
  };

  readonly barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { maxRotation: 45, minRotation: 45 } }
    }
  };

  readonly doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],  // ✅ FIXED: Added 'data:' property with colon
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6']
      }
    ] as ChartDataset<'doughnut'>[]
  };

  readonly doughnutChartOptions: ChartOptions<'doughnut'> = {
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
      reportType: this.reportType()
    };

    this.reportService.getStockReport(request).subscribe({
      next: (data: StockReportData) => {
        this.stockReportData.set(data);
        this.updateTables(data);
        this.updateCharts(data);
        this.reportLoading.set(false);
      },
      error: (error) => {
        this.reportError.set('REPORTS.LOAD_ERROR');
        this.reportLoading.set(false);
        this.snackBar.open(this.translateIfNeeded('REPORTS.LOAD_ERROR'), this.translateIfNeeded('COMMON.CLOSE'), { duration: 3000 });
        console.error('Stock report error:', error);
      }
    });
  }

  // ✅ FIXED: Added proper parameter type annotation
  private updateTables(data: StockReportData): void {
    // Categories Table
    if (data.stockByCategory?.length) {
      this.categoryTableData.set(data.stockByCategory.map((cat: any) => ({
        categoryName: cat.categoryName,
        itemCount: cat.itemCount,
        totalValue: cat.totalValue
      })));
    }

    // Low Stock Table
    if (data.lowStockProducts?.length) {
      this.lowStockTableData.set(data.lowStockProducts.map((item: any) => ({
        ...item,
        progress: Math.min(100, (item.currentStock / (item.minStock || 1)) * 100)
      })));
    }

    // Expiring Table
    if (data.expiringProducts?.length) {
      this.expiringTableData.set(data.expiringProducts.map((item: any) => {
        let status: 'urgent' | 'warning' | 'ok' = 'ok';
        if (item.daysUntilExpiry <= 7) status = 'urgent';
        else if (item.daysUntilExpiry <= 30) status = 'warning';

        return { ...item, status };
      }));
    }
  }

  // ✅ FIXED: Added proper parameter type annotation
  private updateCharts(data: StockReportData): void {
    // Bar chart - Stock by category
    if (data.stockByCategory?.length) {
      this.barChartData.labels = data.stockByCategory.map((c: any) => c.categoryName);
      this.barChartData.datasets[0].data = data.stockByCategory.map((c: any) => c.totalValue);
    }

    // Doughnut chart - Stock status distribution
    const totalItems = data.totalItems || 0;
    const lowStockItems = data.lowStockItems || 0;
    const expiredItems = data.expiredItems || 0;
    const expiringSoonItems = data.expiringSoonItems || 0;

    const statusData = [
      totalItems - lowStockItems - expiredItems,
      lowStockItems,
      expiredItems,
      expiringSoonItems
    ];

    this.doughnutChartData.labels = ['جيد', 'منخفض', 'منتهي', 'ينتهي قريباً'];
    this.doughnutChartData.datasets[0].data = statusData;
  }

  setActiveTable(tab: 'categories' | 'low-stock' | 'expiring'): void {
    this.activeTable.set(tab);
  }

  exportPDF(): void {
    this.snackBar.open(this.translateIfNeeded('REPORTS.EXPORTING_PDF'), this.translateIfNeeded('COMMON.CLOSE'), { duration: 2000 });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'urgent': 'عاجل',
      'warning': 'تحذير',
      'ok': 'جيد'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): 'warn' | 'accent' | 'primary' {
    const colors: Record<string, 'warn' | 'accent' | 'primary'> = {
      'urgent': 'warn',
      'warning': 'accent',
      'ok': 'primary'
    };
    return colors[status] || 'primary';
  }

  private translateIfNeeded(key: string): string {
    const translations: Record<string, string> = {
      'COMMON.CLOSE': 'إغلاق',
      'REPORTS.LOAD_ERROR': 'فشل تحميل التقرير',
      'REPORTS.EXPORTING_PDF': 'جاري تصدير PDF...'
    };
    return translations[key] || key;
  }

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }
}
