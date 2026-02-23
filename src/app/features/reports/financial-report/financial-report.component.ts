import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartDataset } from 'chart.js';
import { ReportService, ReportRequest } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';

interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
  }>;
}

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

  readonly startDate = signal<string>(this.formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1))));
  readonly endDate = signal<string>(this.formatDate(new Date()));
  readonly reportType = signal<'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'>('MONTHLY');

  readonly financialData = signal<FinancialData | null>(null);
  readonly reportLoading = signal(false);
  readonly reportError = signal<string>('');

  // ✅ FIXED: Clean Chart.js configuration with proper 'data:' property
  readonly lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'الإيرادات',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true
      },
      {
        data: [],
        label: 'المصروفات',
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
      next: (data: FinancialData) => {
        this.financialData.set(data);
        this.updateCharts(data);
        this.reportLoading.set(false);
      },
      error: (error) => {
        this.reportError.set('REPORTS.LOAD_ERROR');
        this.reportLoading.set(false);
        this.snackBar.open(this.translate.instant('REPORTS.LOAD_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        console.error('Financial report error:', error);
      }
    });
  }

  private updateCharts(data: FinancialData): void {
    if (data.monthlyData?.length) {
      this.lineChartData.labels = data.monthlyData.map((m: any) => m.month);
      this.lineChartData.datasets[0].data = data.monthlyData.map((m: any) => m.revenue);
      this.lineChartData.datasets[1].data = data.monthlyData.map((m: any) => m.expenses);
    }

    if (data.expensesByCategory?.length) {
      this.pieChartData.labels = data.expensesByCategory.map((c: any) =>
        this.translate.instant(`EXPENSES.${c.category.toUpperCase()}`)
      );
      this.pieChartData.datasets[0].data = data.expensesByCategory.map((c: any) => c.amount);
    }
  }

  exportPDF(): void {
    this.snackBar.open(this.translate.instant('REPORTS.EXPORTING_PDF'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
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
