import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialModule } from '../../../shared/material.module';
import { CrudDialogDirective, CrudDialogTitleKeys } from '../../../core/crud';
import { Product } from '../../../core/models/product.model';
import { toLocalDateString } from '../../../core/utils/format.util';
import { StockBatchModel } from '../stock-management/models/stock-batch.model';
import { StockBatchCrudService } from '../stock-management/services/stock-batch-crud.service';

@Component({
  selector: 'app-stock-batch-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './stock-batch-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stock-batch-dialog.component.scss',
})
export class StockBatchDialogComponent extends CrudDialogDirective<StockBatchModel> {
  private readonly service = inject(StockBatchCrudService);

  readonly products = signal<Product[]>([]);

  readonly titleKeys: CrudDialogTitleKeys = {
    create: 'STOCK.ADD_BATCH',
    update: 'STOCK.EDIT_BATCH',
    view: 'STOCK.EDIT_BATCH',
  };

  override afterBuildForm(): void {
    this.service.getProducts().subscribe({
      next: (products) => this.products.set(products),
      error: () => this.products.set([]),
    });
  }

  // Backend expects LocalDate ("YYYY-MM-DD"), not a full ISO timestamp.
  override populateForm(): void {
    if (this.data.model && this.data.mode !== 'CREATE') {
      const m = this.data.model;
      this.form.patchValue({
        ...m,
        expiryDate: m.expiryDate ? new Date(m.expiryDate) : null,
        productionDate: m.productionDate ? new Date(m.productionDate) : null,
      });
    }
  }

  override prepareModel(): StockBatchModel {
    const model = this.data.model!.clone<StockBatchModel>(this.form.value);
    model.expiryDate = toLocalDateString(this.form.value.expiryDate) ?? '';
    model.productionDate = toLocalDateString(this.form.value.productionDate);
    return model;
  }

  override afterSaveSuccess(saved: StockBatchModel): void {
    this.errorHandler.showSuccess(this.isUpdateMode() ? 'STOCK.UPDATE_SUCCESS' : 'STOCK.ADD_SUCCESS');
    this.dialogRef.close(saved);
  }

  override afterSaveFail(error: unknown): void {
    this.saving.set(false);
    this.errorHandler.handleHttpError(error as HttpErrorResponse, this.isUpdateMode() ? 'STOCK.UPDATE_ERROR' : 'STOCK.ADD_ERROR');
  }
}
