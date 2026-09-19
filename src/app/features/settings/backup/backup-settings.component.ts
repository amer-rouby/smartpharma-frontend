import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { CrudPageWithDialogDirective } from '../../../core/crud';
import { BackupModel } from './models/backup.model';
import { BackupCrudService } from './services/backup-crud.service';

@Component({
  selector: 'app-backup-settings',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent],
  templateUrl: './backup-settings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './backup-settings.component.scss'
})
export class BackupSettingsComponent extends CrudPageWithDialogDirective<BackupModel, BackupCrudService> {
  readonly service = inject(BackupCrudService);

  readonly displayedColumns = ['backupName', 'backupType', 'fileSize', 'status', 'createdAt', 'actions'];

  protected override getDeleteConfirmMessage(backup: BackupModel): string {
    return this.translate.instant('BACKUP.CONFIRM_DELETE', { name: backup.backupName });
  }

  protected override getDeleteSuccessKey(): string {
    return 'BACKUP.DELETE_SUCCESS';
  }

  protected override getDeleteErrorKey(): string {
    return 'BACKUP.DELETE_ERROR';
  }

  onDownloadBackup(backup: BackupModel): void {
    this.service.downloadBackup(backup.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${backup.backupName}.sql`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.errorHandler.showSuccess('BACKUP.DOWNLOAD_SUCCESS');
      },
      error: (err) => {
        this.errorHandler.handleHttpError(err, 'BACKUP.DOWNLOAD_ERROR');
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('ar-EG');
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'COMPLETED': '#10b981',
      'PENDING': '#f59e0b',
      'FAILED': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'COMPLETED': 'BACKUP.STATUS.COMPLETED',
      'PENDING': 'BACKUP.STATUS.PENDING',
      'FAILED': 'BACKUP.STATUS.FAILED'
    };
    return this.translate.instant(labels[status] || status);
  }
}
