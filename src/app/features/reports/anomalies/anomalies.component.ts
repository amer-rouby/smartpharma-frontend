import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { TableLoadingComponent } from '../../../shared/components/table-loading/table-loading.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Anomaly, AnomalyCounts } from '../../../core/models/anomaly.model';
import { CrudPageDirective } from '../../../core/crud';
import { AnomalyCrudService } from './services/anomaly-crud.service';

@Component({
  selector: 'app-anomalies',
  standalone: true,
  imports: [
    MaterialModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    MatPaginatorModule,
    TableLoadingComponent,
    EmptyStateComponent
  ],
  templateUrl: './anomalies.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './anomalies.component.scss'
})
export class AnomaliesComponent extends CrudPageDirective<Anomaly, AnomalyCrudService> {
  readonly service = inject(AnomalyCrudService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly counts = signal<AnomalyCounts | null>(null);

  readonly displayedColumns = ['type', 'description', 'severity', 'status', 'detectedAt', 'actions'];
  readonly filterForm: FormGroup = this.fb.group({ status: ['all'], type: ['all'] });

  constructor() {
    super();
    this.loadCounts();
  }

  protected override buildLoadOptions(page: number, size: number, search: string): Record<string, unknown> {
    const options = super.buildLoadOptions(page, size, search);
    const status = this.filterForm.get('status')?.value;
    const type = this.filterForm.get('type')?.value;
    if (status && status !== 'all') options['status'] = status;
    if (type && type !== 'all') options['type'] = type;
    return options;
  }

  loadCounts(): void {
    this.service.getCounts().subscribe({
      next: (data) => this.counts.set(data)
    });
  }

  onFilterChange(): void {
    this.pageIndex.set(0);
    this.refresh();
  }

  onMarkReviewed(anomaly: Anomaly): void {
    this.service.markReviewed(anomaly.id).subscribe({
      next: () => {
        this.errorHandler.showSuccess('ANOMALIES.MARKED_REVIEWED');
        this.refresh();
        this.loadCounts();
      },
      error: () => this.errorHandler.showError('ANOMALIES.UPDATE_ERROR')
    });
  }

  onDismiss(anomaly: Anomaly): void {
    this.confirmDialog.open({
      titleKey: 'ANOMALIES.CONFIRM_DISMISS_TITLE',
      messageKey: 'ANOMALIES.CONFIRM_DISMISS_MSG',
      confirmKey: 'COMMON.CONFIRM',
      color: 'primary'
    }).subscribe(result => {
      if (result) {
        this.service.dismiss(anomaly.id).subscribe({
          next: () => {
            this.errorHandler.showSuccess('ANOMALIES.DISMISSED');
            this.refresh();
            this.loadCounts();
          },
          error: () => this.errorHandler.showError('ANOMALIES.UPDATE_ERROR')
        });
      }
    });
  }

  getTypeLabel(type: string): string {
    return this.translate.instant('ANOMALIES.TYPE.' + type);
  }

  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = { 'LOW': '#10b981', 'MEDIUM': '#f59e0b', 'HIGH': '#ef4444' };
    return colors[severity] || '#6b7280';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = { 'NEW': '#3b82f6', 'REVIEWED': '#10b981', 'DISMISSED': '#6b7280' };
    return colors[status] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    return this.translate.instant('ANOMALIES.STATUS.' + status);
  }
}
