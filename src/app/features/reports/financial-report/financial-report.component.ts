import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartDataset } from 'chart.js';
import { ReportService } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinancialReportData, ReportRequest } from '../../../core/models/Report.model';

@Component({
  selector: 'app-financial-report',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule, MaterialModule,
    PageHeaderComponent, BaseChartDirective
  ],
  templateUrl: './financial-report.component.html',
  styleUrl: './financial-report.component.scss'
})
export class FinancialReportComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly exportService = inject(ExportService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly startDate = signal<string>(this.formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1))));
  readonly endDate = signal<string>(this.formatDate(new Date()));
  readonly reportType = signal<'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'>('MONTHLY');
  readonly financialData = signal<FinancialReportData | null>(null);
  readonly reportLoading = signal(false);
  readonly reportError = signal<string>('');
  readonly exportLoading = signal(false);

  readonly lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: this.translate.instant('REPORTS.REVENUE'), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)', tension: 0.4, fill: true },
      { data: [], label: this.translate.instant('REPORTS.EXPENSES'), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', tension: 0.4, fill: true }
    ] as ChartDataset<'line'>[]
  };

  readonly lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom' } }
  };

  readonly pieChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'] }] as ChartDataset<'doughnut'>[]
  };

  readonly pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom' } }
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
      error: (err) => {
        this.reportError.set('REPORTS.LOAD_ERROR');
        this.reportLoading.set(false);
        this.errorHandler.handleHttpError(err, 'REPORTS.LOAD_ERROR');
      }
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

  exportPDF(): void {
    this.exportLoading.set(true);
    this.exportService.exportReport({
      fileName: `financial_report_${this.startDate()}_to_${this.endDate()}.pdf`,
      fileType: 'pdf',
      endpoint: '/financial/pdf',
      params: {
        pharmacyId: this.getPharmacyId(),
        startDate: this.startDate(),
        endDate: this.endDate()
      },
      preview: false,
      onError: () => {
        this.exportLoading.set(false);
        this.errorHandler.showError('REPORTS.EXPORT_ERROR');
      }
    }).subscribe({
      next: () => {
        this.exportLoading.set(false);
        this.errorHandler.showSuccess('REPORTS.EXPORT_SUCCESS');
      },
      error: () => {
        this.exportLoading.set(false);
        this.errorHandler.showError('REPORTS.EXPORT_ERROR');
      }
    });
  }

  exportExcel(): void {
    this.exportLoading.set(true);
    this.exportService.exportReport({
      fileName: `financial_report_${this.startDate()}_to_${this.endDate()}.xlsx`,
      fileType: 'excel',
      endpoint: '/financial/excel',
      params: {
        pharmacyId: this.getPharmacyId(),
        startDate: this.startDate(),
        endDate: this.endDate()
      },
      preview: false,
      onError: () => {
        this.exportLoading.set(false);
        this.errorHandler.showError('REPORTS.EXPORT_ERROR');
      }
    }).subscribe({
      next: () => {
        this.exportLoading.set(false);
        this.errorHandler.showSuccess('REPORTS.EXPORT_SUCCESS');
      },
      error: () => {
        this.exportLoading.set(false);
        this.errorHandler.showError('REPORTS.EXPORT_ERROR');
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 }).format(amount);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }
}
