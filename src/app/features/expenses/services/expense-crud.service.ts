import { Injectable, Type } from '@angular/core';
import { CastResponseContainer } from 'cast-response';
import { CrudWithDialogService, PagedResult, RegisterServiceMixin } from '../../../core/crud';
import { environment } from '../../../../environments/environment';
import { ExpenseModel } from '../models/expense.model';
import { AddExpenseDialogComponent } from '../add-expense-dialog/add-expense-dialog.component';

@CastResponseContainer({
  $default: {
    model: () => ExpenseModel,
  },
  $pagination: {
    model: () => PagedResult,
    shape: {
      'content.*': () => ExpenseModel,
    },
  },
})
@Injectable({ providedIn: 'root' })
export class ExpenseCrudService extends RegisterServiceMixin(CrudWithDialogService)<ExpenseModel, AddExpenseDialogComponent, number> {
  $$serviceName = 'ExpenseCrudService';

  override getSegmentUrl(): string {
    return `${environment.apiUrl}/expenses`;
  }

  override getGetAllEndpoint(): string {
    return this.getSegmentUrl();
  }

  override getDialogComponent(): Type<AddExpenseDialogComponent> {
    return AddExpenseDialogComponent;
  }

  override getModelInstance(): ExpenseModel {
    const model = new ExpenseModel();
    model.pharmacyId = this.getPharmacyId();
    return model;
  }

  // Backend request shape has no id/createdBy/createdAt/updatedAt - only send
  // what create/update actually accept (same reasoning as CategoryCrudService).
  override toRequestPayload(model: ExpenseModel): unknown {
    const { pharmacyId, category, title, description, amount, expenseDate, paymentMethod, referenceNumber } = model;
    return { pharmacyId, category, title, description, amount, expenseDate, paymentMethod, referenceNumber };
  }
}
