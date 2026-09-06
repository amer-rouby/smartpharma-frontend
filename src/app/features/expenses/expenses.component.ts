import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../shared/material.module';
import { CrudPageWithDialogDirective } from '../../core/crud';
import { CurrencyService } from '../../core/services/currency.service';
import { ExpenseCrudService } from './services/expense-crud.service';
import { ExpenseModel } from './models/expense.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MaterialModule, PageHeaderComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent extends CrudPageWithDialogDirective<ExpenseModel, ExpenseCrudService> {
  readonly service = inject(ExpenseCrudService);
  private readonly currencyService = inject(CurrencyService);

  readonly displayedColumns = ['category', 'title', 'amount', 'expenseDate', 'paymentMethod', 'actions'];
  readonly hasPagination = computed(() => this.totalElements() > this.pageSize());
  readonly totalAmount = computed(() => this.models().reduce((sum, e) => sum + e.amount, 0));

  protected override getDeleteConfirmMessage(): string {
    return this.translate.instant('EXPENSES.DELETE_CONFIRM_MESSAGE');
  }

  protected override getDeleteSuccessKey(): string {
    return 'EXPENSES.DELETE_SUCCESS';
  }

  protected override getDeleteErrorKey(): string {
    return 'EXPENSES.DELETE_ERROR';
  }

  formatCurrency(amount: number): string {
    return this.currencyService.format(amount, 'ar');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
