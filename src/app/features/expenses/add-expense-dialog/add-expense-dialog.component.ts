import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';
import { Expense, ExpenseService } from '../../../core/services/expense.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-add-expense-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MaterialModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>{{'EXPENSES.ADD_EXPENSE' | translate}}</h2>

      <mat-dialog-content>
        <form #expenseForm="ngForm" (ngSubmit)="onSubmit()">

          <!-- Category -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{'EXPENSES.CATEGORY' | translate}}</mat-label>
            <mat-select [(ngModel)]="expense.category" name="category" required>
              @for (cat of categories; track cat.value) {
                <mat-option [value]="cat.value">{{cat.labelAr}}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <!-- Title -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{'EXPENSES.TITLE' | translate}}</mat-label>
            <input matInput [(ngModel)]="expense.title" name="title" required maxlength="200">
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{'EXPENSES.DESCRIPTION' | translate}}</mat-label>
            <textarea matInput [(ngModel)]="expense.description" name="description" rows="3" maxlength="1000"></textarea>
          </mat-form-field>

          <!-- Amount -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{'EXPENSES.AMOUNT' | translate}}</mat-label>
            <input matInput type="number" [(ngModel)]="expense.amount" name="amount" required min="0.01" step="0.01">
          </mat-form-field>

          <!-- Expense Date -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{'EXPENSES.DATE' | translate}}</mat-label>
            <input matInput [matDatepicker]="picker" [(ngModel)]="expenseDate" name="expenseDate" required>
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <!-- Payment Method -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{'EXPENSES.PAYMENT_METHOD' | translate}}</mat-label>
            <mat-select [(ngModel)]="expense.paymentMethod" name="paymentMethod">
              @for (method of paymentMethods; track method.value) {
                <mat-option [value]="method.value">{{method.labelAr}}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <!-- Reference Number -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{'EXPENSES.REFERENCE_NUMBER' | translate}}</mat-label>
            <input matInput [(ngModel)]="expense.referenceNumber" name="referenceNumber" maxlength="100">
          </mat-form-field>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">{{'COMMON.CANCEL' | translate}}</button>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!isValid()">
          {{'COMMON.SAVE' | translate}}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
      max-width: 90vw;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class AddExpenseDialogComponent {
  private readonly expenseService = inject(ExpenseService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  readonly dialogRef = inject(MatDialogRef<AddExpenseDialogComponent>);

  readonly categories = this.expenseService.getExpenseCategories();
  readonly paymentMethods = this.expenseService.getPaymentMethods();

  expense: Expense = {
    pharmacyId: this.authService.getPharmacyId() || 1,
    category: 'PURCHASES',
    title: '',
    description: '',
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    referenceNumber: ''
  };

  expenseDate: Date = new Date();

  // ✅ FIXED: Return explicit boolean values
  isValid(): boolean {
    const hasCategory = !!this.expense.category && this.expense.category.length > 0;
    const hasTitle = !!this.expense.title && this.expense.title.length > 0;
    const hasValidAmount = this.expense.amount > 0;
    const hasValidDate = this.expenseDate !== null && !isNaN(this.expenseDate.getTime());

    return hasCategory && hasTitle && hasValidAmount && hasValidDate;
  }

  onSubmit(): void {
    if (!this.isValid()) {
      this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'إغلاق', { duration: 3000 });
      return;
    }

    // Format date properly
    this.expense.expenseDate = this.formatDateForApi(this.expenseDate);

    this.expenseService.createExpense(this.expense).subscribe({
      next: () => {
        this.snackBar.open('تم إضافة المصروف بنجاح', 'إغلاق', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.snackBar.open('فشل إضافة المصروف', 'إغلاق', { duration: 3000 });
        console.error('Create expense error:', error);
      }
    });
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
