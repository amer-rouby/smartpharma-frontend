import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialModule } from '../../../../shared/material.module';
import { CrudDialogDirective, CrudDialogTitleKeys } from '../../../../core/crud';
import { BackupModel } from '../models/backup.model';

@Component({
  selector: 'app-backup-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './backup-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './backup-dialog.component.scss',
})
export class BackupDialogComponent extends CrudDialogDirective<BackupModel> {
  // Only ever opened in CREATE mode (a backup has nothing to update/view once
  // taken) - update/view keys are required by the interface but unreachable.
  readonly titleKeys: CrudDialogTitleKeys = {
    create: 'BACKUP.CREATE_BACKUP',
    update: 'BACKUP.CREATE_BACKUP',
    view: 'BACKUP.CREATE_BACKUP',
  };

  override afterSaveSuccess(saved: BackupModel): void {
    this.errorHandler.showSuccess('BACKUP.CREATE_SUCCESS');
    this.dialogRef.close(saved);
  }

  override afterSaveFail(error: unknown): void {
    this.saving.set(false);
    this.errorHandler.handleHttpError(error as HttpErrorResponse, 'BACKUP.CREATE_ERROR');
  }
}
