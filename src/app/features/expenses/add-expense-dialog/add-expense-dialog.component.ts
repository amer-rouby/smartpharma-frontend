import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';
import {ExpenseService } from '../../../core/services/expense.service';
import { AuthService } from '../../../core/services/auth.service';
import { Expense } from '../../../core/models/Expense.model';

@Component({
  selector: 'app-add-expense-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MaterialModule
  ],
  templateUrl: "./add-expense-dialog.component.html",
  styleUrl:"./add-expense-dialog.component.scss"
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
