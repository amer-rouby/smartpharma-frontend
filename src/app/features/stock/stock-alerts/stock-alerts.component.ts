import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';
import { AlertStats, StockAlert } from '../../../core/models/stock-alert.model';
import { CrudPageDirective } from '../../../core/crud';
import { StockAlertCrudService } from './services/stock-alert-crud.service';

@Component({
  selector: 'app-stock-alerts', standalone: true,
  imports: [MaterialModule, PageHeaderComponent, ReactiveFormsModule],
  templateUrl: './stock-alerts.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stock-alerts.component.scss'
})
export class StockAlertsComponent extends CrudPageDirective<StockAlert, StockAlertCrudService> implements OnInit, OnDestroy {
  readonly service = inject(StockAlertCrudService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  readonly stats = signal<AlertStats | null>(null);

  readonly displayedColumns = ['alertType', 'product', 'message', 'severity', 'status', 'createdAt', 'actions'];
  readonly filterForm: FormGroup = this.fb.group({ alertType: ['all'], status: ['all'] });

  protected override buildLoadOptions(page: number, size: number, search: string): Record<string, unknown> {
    const options = super.buildLoadOptions(page, size, search);
    const alertType = this.filterForm.get('alertType')?.value;
    const status = this.filterForm.get('status')?.value;
    if (alertType && alertType !== 'all') options['alertType'] = alertType;
    if (status && status !== 'all') options['status'] = status;
    return options;
  }

  ngOnInit(): void {
    this.loadStats();

    this.notificationService.stockChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.refresh();
      this.loadStats();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStats(): void {
    this.service.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  onFilterChange(): void {
    this.pageIndex.set(0);
    this.refresh();
  }

  onMarkAsRead(alertId: number): void {
    this.service.markAsRead(alertId).subscribe({
      next: () => {
        this.errorHandler.showSuccess('STOCK_ALERTS.MARKED_READ');
        this.refresh();
        this.loadStats();
      },
      error: (error) => this.errorHandler.handleHttpError(error, 'STOCK_ALERTS.LOAD_ERROR')
    });
  }

  onResolve(alertId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('STOCK_ALERTS.CONFIRM_RESOLVE_TITLE'),
        message: this.translate.instant('STOCK_ALERTS.CONFIRM_RESOLVE_MSG'),
        confirmText: this.translate.instant('COMMON.CONFIRM'),
        cancelText: this.translate.instant('COMMON.CANCEL')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.resolveAlert(alertId).subscribe({
          next: () => {
            this.errorHandler.showSuccess('STOCK_ALERTS.RESOLVED');
            this.refresh();
            this.loadStats();
          },
          error: (error) => this.errorHandler.handleHttpError(error, 'STOCK_ALERTS.LOAD_ERROR')
        });
      }
    });
  }

  onDelete(alertId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('STOCK_ALERTS.CONFIRM_DELETE_TITLE'),
        message: this.translate.instant('STOCK_ALERTS.CONFIRM_DELETE_MSG'),
        confirmText: this.translate.instant('COMMON.DELETE'),
        cancelText: this.translate.instant('COMMON.CANCEL')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.delete(alertId).subscribe({
          next: () => {
            this.errorHandler.showSuccess('STOCK_ALERTS.DELETED');
            this.refresh();
            this.loadStats();
          },
          error: (error) => this.errorHandler.handleHttpError(error, 'STOCK_ALERTS.LOAD_ERROR')
        });
      }
    });
  }

  onMarkAllAsRead(): void {
    this.service.markAllAsRead().subscribe({
      next: () => {
        this.errorHandler.showSuccess('STOCK_ALERTS.ALL_MARKED_READ');
        this.refresh();
        this.loadStats();
      },
      error: (error) => this.errorHandler.handleHttpError(error, 'STOCK_ALERTS.LOAD_ERROR')
    });
  }

  getAlertTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'LOW_STOCK': 'STOCK_ALERTS.TYPE.LOW_STOCK', 'OUT_OF_STOCK': 'STOCK_ALERTS.TYPE.OUT_OF_STOCK',
      'EXPIRING_SOON': 'STOCK_ALERTS.TYPE.EXPIRING_SOON', 'EXPIRED': 'STOCK_ALERTS.TYPE.EXPIRED'
    };
    return this.translate.instant(labels[type] || type);
  }

  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = { 'LOW': '#10b981', 'MEDIUM': '#f59e0b', 'HIGH': '#ef4444', 'CRITICAL': '#dc2626' };
    return colors[severity] || '#6b7280';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = { 'UNREAD': '#3b82f6', 'READ': '#10b981', 'RESOLVED': '#6b7280' };
    return colors[status] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { 'UNREAD': 'STOCK_ALERTS.STATUS.UNREAD', 'READ': 'STOCK_ALERTS.STATUS.READ', 'RESOLVED': 'STOCK_ALERTS.STATUS.RESOLVED' };
    return this.translate.instant(labels[status] || status);
  }

  formatDate(dateString: string): string { return new Date(dateString).toLocaleString('ar-EG'); }
}
