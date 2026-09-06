import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialModule } from '../../../shared/material.module';
import { CrudDialogDirective, CrudDialogTitleKeys } from '../../../core/crud';
import { UserRole } from '../../../core/models/user.model';
import { UserModel } from '../models/user.model';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './user-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user-dialog.component.scss',
})
export class UserDialogComponent extends CrudDialogDirective<UserModel> {
  readonly titleKeys: CrudDialogTitleKeys = {
    create: 'USERS.ADD_NEW',
    update: 'USERS.EDIT',
    view: 'USERS.EDIT',
  };

  readonly userRoles = [
    { value: UserRole.ADMIN, label: 'USERS.ADMIN' },
    { value: UserRole.PHARMACIST, label: 'USERS.PHARMACIST' },
    { value: UserRole.MANAGER, label: 'USERS.MANAGER' },
    { value: UserRole.VIEWER, label: 'USERS.VIEWER' },
  ];

  // Password is required on create, optional on update (leave blank to keep current).
  override afterBuildForm(): void {
    if (this.isCreateMode()) {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  override afterSaveSuccess(saved: UserModel): void {
    this.errorHandler.showSuccess(this.isUpdateMode() ? 'USERS.UPDATE_SUCCESS' : 'USERS.ADD_SUCCESS');
    this.dialogRef.close(saved);
  }

  override afterSaveFail(error: unknown): void {
    this.saving.set(false);
    this.errorHandler.handleHttpError(error as HttpErrorResponse, 'USERS.ERROR');
  }
}
