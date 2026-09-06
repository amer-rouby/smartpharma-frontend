import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialModule } from '../../../../shared/material.module';
import { CrudDialogDirective, CrudDialogTitleKeys } from '../../../../core/crud';
import { SupplierModel } from '../models/supplier.model';

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './supplier-dialog.component.html',
  styleUrl: './supplier-dialog.component.scss',
})
export class SupplierDialogComponent extends CrudDialogDirective<SupplierModel> {
  readonly titleKeys: CrudDialogTitleKeys = {
    create: 'SUPPLIERS.ADD',
    update: 'SUPPLIERS.EDIT',
    view: 'SUPPLIERS.EDIT',
  };

  override afterSaveSuccess(saved: SupplierModel): void {
    this.errorHandler.showSuccess(this.isUpdateMode() ? 'SUPPLIERS.UPDATE_SUCCESS' : 'SUPPLIERS.ADD_SUCCESS');
    this.dialogRef.close(saved);
  }

  override afterSaveFail(error: unknown): void {
    this.saving.set(false);
    this.errorHandler.handleHttpError(error as HttpErrorResponse, this.isUpdateMode() ? 'SUPPLIERS.UPDATE_ERROR' : 'SUPPLIERS.ADD_ERROR');
  }
}
