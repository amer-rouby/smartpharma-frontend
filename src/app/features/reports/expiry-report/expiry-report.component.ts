import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartDataset } from 'chart.js';
import { ReportService } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';
import { ExpiryData, ReportRequest } from '../../../core/models/Report.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';


@Component({
  selector: 'app-expiry-report',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule, MaterialModule,
    PageHeaderComponent, BaseChartDirective
  ],
  templateUrl: './expiry-report.component.html',
  styleUrl: './expiry-report.component.scss'
})
export class ExpiryReportComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly exportService = inject(ExportService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly reportType = signal<'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'>('CUSTOM');
  readonly expiryData = signal<ExpiryData | null>(null);
  readonly reportLoading = signal(false);
  readonly reportError = signal<string>('');
  readonly exportLoading = signal(false);

  readonly displayedColumns = ['productName', 'batchNumber', 'expiryDate', 'daysUntilExpiry', 'currentStock', 'status'];

  readonly doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['عاجل (7 أيام)', 'تحذير (30 يوم)', 'جيد (90 يوم)'],
    datasets: [{ data: [], backgroundColor: ['#ef4444', '#f59e0b', '#10b981'] }] as ChartDataset<'doughnut'>[]
  };

  readonly doughnutChartOptions: ChartOptions<'doughnut'> = {
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
      reportType: this.reportType()
    };

    this.reportService.getExpiryReport(request).subscribe({
      next: (data: ExpiryData) => {
        this.expiryData.set(data);
        this.updateChart(data);
        this.reportLoading.set(false);
      },
      error: (err) => {
        this.reportError.set('REPORTS.LOAD_ERROR');
        this.reportLoading.set(false);
        this.errorHandler.handleHttpError(err, 'REPORTS.LOAD_ERROR');
      }
    });
  }

  private updateChart(data: ExpiryData): void {
    this.doughnutChartData.datasets[0].data = [
      data.urgentExpiring || 0,
      data.warningExpiring || 0,
      data.okExpiring || 0
    ];
  }

  exportPDF(): void {
    this.exportLoading.set(true);
    this.exportService.exportReport({
      fileName: `expiry_report_${new Date().toISOString().split('T')[0]}.pdf`,
      fileType: 'pdf',
      endpoint: '/expiry/pdf',
      params: { pharmacyId: this.getPharmacyId() },
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
      fileName: `expiry_report_${new Date().toISOString().split('T')[0]}.xlsx`,
      fileType: 'excel',
      endpoint: '/expiry/excel',
      params: { pharmacyId: this.getPharmacyId() },
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

  getStatusColor(status: string): 'warn' | 'accent' | 'primary' {
    const map: Record<string, 'warn' | 'accent' | 'primary'> = {
      'URGENT': 'warn', 'WARNING': 'accent', 'OK': 'primary'
    };
    return map[status] || 'primary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { 'URGENT': 'عاجل', 'WARNING': 'تحذير', 'OK': 'جيد' };
    return this.translate.instant(map[status] || status);
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
