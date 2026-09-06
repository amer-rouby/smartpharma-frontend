import { Component, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../../../shared/material.module';
import { CrudDialogDirective, CrudDialogTitleKeys } from '../../../core/crud';
import { ExpenseService } from '../../../core/services/expense.service';
import { ExpenseModel } from '../models/expense.model';

@Component({
  selector: 'app-add-expense-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, MaterialModule],
  templateUrl: './add-expense-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add-expense-dialog.component.scss',
})
export class AddExpenseDialogComponent extends CrudDialogDirective<ExpenseModel> implements OnDestroy {
  private readonly expenseService = inject(ExpenseService);
  private readonly translateService = inject(TranslateService);
  private langChangeSub?: Subscription;

  readonly titleKeys: CrudDialogTitleKeys = {
    create: 'EXPENSES.ADD_NEW',
    update: 'EXPENSES.EDIT',
    view: 'EXPENSES.EDIT',
  };

  categories: { value: string; label: string }[] = [];
  paymentMethods: { value: string; label: string }[] = [];

  override afterBuildForm(): void {
    this.loadOptions();
    this.langChangeSub = this.translateService.onLangChange.subscribe(() => this.loadOptions());
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }

  private loadOptions(): void {
    this.categories = this.expenseService.getExpenseCategories();
    this.paymentMethods = this.expenseService.getPaymentMethods();
  }

  // The model stores expenseDate as the API's local "YYYY-MM-DDTHH:mm:00" string,
  // but the form control needs a real Date for matDatepicker - convert both ways.
  override populateForm(): void {
    super.populateForm();
    if (this.data.model?.expenseDate) {
      this.form.patchValue({ expenseDate: new Date(this.data.model.expenseDate) });
    }
  }

  override prepareModel(): ExpenseModel {
    const model = super.prepareModel();
    model.expenseDate = this.formatDateForApi(this.form.value.expenseDate as Date);
    return model;
  }

  override afterSaveSuccess(saved: ExpenseModel): void {
    this.errorHandler.showSuccess(this.isUpdateMode() ? 'EXPENSES.UPDATE_SUCCESS' : 'EXPENSES.ADD_SUCCESS');
    this.dialogRef.close(saved);
  }

  override afterSaveFail(error: unknown): void {
    this.saving.set(false);
    this.errorHandler.handleHttpError(error as HttpErrorResponse, this.isUpdateMode() ? 'EXPENSES.UPDATE_ERROR' : 'EXPENSES.ADD_ERROR');
  }

  private formatDateForApi(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  }
}
