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
import { ExportService } from '../../../core/services/export.service';

interface ExpiryData {
  totalExpiring: number;
  urgentExpiring: number;
  warningExpiring: number;
  okExpiring: number;
  expiringProducts: Array<{
    productId: number;
    productName: string;
    batchNumber: string;
    expiryDate: string;
    daysUntilExpiry: number;
    currentStock: number;
    status: 'URGENT' | 'WARNING' | 'OK';
    estimatedValue: number;
  }>;
}

@Component({
  selector: 'app-expiry-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MaterialModule,
    PageHeaderComponent,
    BaseChartDirective
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
  readonly reportType = signal<'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'>('CUSTOM');

  readonly expiryData = signal<ExpiryData | null>(null);
  readonly reportLoading = signal(false);
  readonly reportError = signal<string>('');

  readonly displayedColumns = ['productName', 'batchNumber', 'expiryDate', 'daysUntilExpiry', 'currentStock', 'status'];
  readonly exportLoading = signal(false);
  readonly doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['عاجل (7 أيام)', 'تحذير (30 يوم)', 'جيد (90 يوم)'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
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

  exportPDF(): void {
    this.exportLoading.set(true);

    this.exportService.exportExpensesPdf(
      this.getPharmacyId(),
      0,
      100,
      true
    ).subscribe({
      next: () => this.exportLoading.set(false),
      error: () => this.exportLoading.set(false)
    });
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
      error: (error) => {
        this.reportError.set('REPORTS.LOAD_ERROR');
        this.reportLoading.set(false);
        this.snackBar.open(this.translate.instant('REPORTS.LOAD_ERROR'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
        console.error('Expiry report error:', error);
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

  getStatusColor(status: string): 'warn' | 'accent' | 'primary' {
    const colors: Record<string, 'warn' | 'accent' | 'primary'> = {
      'URGENT': 'warn',
      'WARNING': 'accent',
      'OK': 'primary'
    };
    return colors[status] || 'primary';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'URGENT': 'عاجل',
      'WARNING': 'تحذير',
      'OK': 'جيد'
    };
    return labels[status] || status;
  }

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }
}
