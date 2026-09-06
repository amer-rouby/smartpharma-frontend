import { Validators } from '@angular/forms';
import { CrudModel, HasForm } from '../../../core/crud';
import { ExpenseCategory } from '../../../core/models/Expense.model';
import { ExpenseCrudService } from '../services/expense-crud.service';

export class ExpenseModel extends CrudModel<ExpenseModel, ExpenseCrudService> implements HasForm {
  override $$primaryKey = 'id' as const;
  override $$service = 'ExpenseCrudService';

  id = 0;
  pharmacyId = 0;
  category: ExpenseCategory = 'PURCHASES';
  title = '';
  description = '';
  amount = 0;
  expenseDate = '';
  paymentMethod = 'CASH';
  referenceNumber = '';
  attachmentUrl = '';
  createdBy = '';
  createdAt = '';
  updatedAt = '';

  buildForm() {
    return {
      category: ['PURCHASES', Validators.required],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(1000)],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      expenseDate: [new Date(), Validators.required],
      paymentMethod: ['CASH'],
      referenceNumber: ['', Validators.maxLength(100)],
    };
  }
}
