import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartDataset } from 'chart.js';
import { ReportService, ReportRequest, FinancialReportData } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-financial-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MaterialModule,
    PageHeaderComponent,
    BaseChartDirective
  ],
  templateUrl: './financial-report.component.html',
  styleUrl: './financial-report.component.scss'
})
export class FinancialReportComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly exportService = inject(ExportService);

  // ✅ Date signals (strings for API)
  readonly startDate = signal<string>(this.formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1))));
  readonly endDate = signal<string>(this.formatDate(new Date()));
  readonly reportType = signal<'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'>('MONTHLY');

  // ✅ Report data signals
  readonly financialData = signal<FinancialReportData | null>(null);
  readonly reportLoading = signal(false);
  readonly reportError = signal<string>('');
  readonly exportLoading = signal(false);

  // ✅ Chart data
  readonly lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: this.translate.instant('REPORTS.REVENUE'),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true
      },
      {
        data: [],
        label: this.translate.instant('REPORTS.EXPENSES'),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
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
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6']
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

    this.reportService.getFinancialReport(request).subscribe({
      next: (data: FinancialReportData) => {
        this.financialData.set(data);
        this.updateCharts(data);
        this.reportLoading.set(false);
      },
      error: (error) => {
        this.reportError.set('REPORTS.LOAD_ERROR');
        this.reportLoading.set(false);
        this.snackBar.open(
          this.translate.instant('REPORTS.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        console.error('Financial report error:', error);
      }
    });
  }

  // ✅ Export PDF with preview
  exportPDF(): void {
    this.exportLoading.set(true);

    this.exportService.exportExpensesPdf(
      this.getPharmacyId(),
      0,
      100,
      true  // preview = true
    ).subscribe({
      next: () => this.exportLoading.set(false),
      error: () => this.exportLoading.set(false)
    });
  }

  // ✅ Export Excel (direct download)
  exportExcel(): void {
    this.exportLoading.set(true);

    this.exportService.exportFinancialExcel(
      this.getPharmacyId(),
      this.startDate(),
      this.endDate(),
      false  // preview = false
    ).subscribe({
      next: () => this.exportLoading.set(false),
      error: () => this.exportLoading.set(false)
    });
  }

  private updateCharts(data: FinancialReportData): void {
    if (data.monthlyData?.length) {
      this.lineChartData.labels = data.monthlyData.map(m => m.month);
      this.lineChartData.datasets[0].data = data.monthlyData.map(m => m.revenue);
      this.lineChartData.datasets[1].data = data.monthlyData.map(m => m.expenses);
    }

    if (data.expensesByCategory?.length) {
      this.pieChartData.labels = data.expensesByCategory.map(c => {
        const key = `EXPENSES.${c.category.toUpperCase()}`;
        const translated = this.translate.instant(key);
        return translated !== key ? translated : c.category;
      });
      this.pieChartData.datasets[0].data = data.expensesByCategory.map(c => c.amount);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }
}
