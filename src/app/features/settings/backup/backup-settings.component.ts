import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { BackupService } from '../../../core/services/settings/backup.service';

interface Backup {
  id: number;
  backupName: string;
  filePath: string;
  fileSize: number;
  backupType: string;
  status: string;
  description: string;
  createdAt: string;
  restoredAt?: string;
}

@Component({
  selector: 'app-backup-settings',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, ReactiveFormsModule],
  templateUrl: './backup-settings.component.html',
  styleUrl: './backup-settings.component.scss'
})
export class BackupSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly backupService = inject(BackupService);

  readonly loading = signal(false);
  readonly creating = signal(false);
  readonly backups = signal<Backup[]>([]);

  backupForm: FormGroup;
  displayedColumns = ['backupName', 'backupType', 'fileSize', 'status', 'createdAt', 'actions'];

  constructor() {
    this.backupForm = this.fb.group({
      backupName: ['', [Validators.required, Validators.minLength(3)]],
      backupType: ['FULL', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadBackups();
  }

  loadBackups(): void {
    this.loading.set(true);

    this.backupService.getBackups().subscribe({
      next: (data) => {
        this.backups.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading backups:', error);
        this.snackBar.open(
          this.translate.instant('BACKUP.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        this.loading.set(false);
      }
    });
  }

  onCreateBackup(): void {
    if (this.backupForm.invalid) {
      this.snackBar.open(
        this.translate.instant('VALIDATION.REQUIRED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    this.creating.set(true);

    this.backupService.createBackup(this.backupForm.value).subscribe({
      next: () => {
        this.creating.set(false);
        this.backupForm.reset({
          backupType: 'FULL'
        });
        this.loadBackups();
        this.snackBar.open(
          this.translate.instant('BACKUP.CREATE_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error) => {
        this.creating.set(false);
        this.snackBar.open(
          this.translate.instant('BACKUP.CREATE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        console.error('Error creating backup:', error);
      }
    });
  }

  onRestoreBackup(backup: Backup): void {
    if (!confirm(this.translate.instant('BACKUP.CONFIRM_RESTORE', { name: backup.backupName }))) {
      return;
    }

    this.backupService.restoreBackup(backup.id).subscribe({
      next: () => {
        this.loadBackups();
        this.snackBar.open(
          this.translate.instant('BACKUP.RESTORE_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error) => {
        this.snackBar.open(
          this.translate.instant('BACKUP.RESTORE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        console.error('Error restoring backup:', error);
      }
    });
  }

  onDeleteBackup(backup: Backup): void {
    if (!confirm(this.translate.instant('BACKUP.CONFIRM_DELETE', { name: backup.backupName }))) {
      return;
    }

    this.backupService.deleteBackup(backup.id).subscribe({
      next: () => {
        this.backups.update(backups => backups.filter(b => b.id !== backup.id));
        this.snackBar.open(
          this.translate.instant('BACKUP.DELETE_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error) => {
        this.snackBar.open(
          this.translate.instant('BACKUP.DELETE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        console.error('Error deleting backup:', error);
      }
    });
  }

  onDownloadBackup(backup: Backup): void {
    this.backupService.downloadBackup(backup.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${backup.backupName}.sql`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.snackBar.open(
          this.translate.instant('BACKUP.DOWNLOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        console.error('Error downloading backup:', error);
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
    return labels[status] || status;
  }
}
