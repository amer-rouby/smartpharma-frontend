import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import { SaleResponse } from '../../../core/models/sale.model';
import { SaleReturn } from '../../../core/models/sale-return.model';
import { SaleReturnService } from '../../../core/services/sale-return.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { LanguageService } from '../../../core/services/language.service';

interface ReturnLine {
  saleItemId: number;
  productName: string;
  /** A sale takes from several batches when one doesn't cover the quantity. */
  batchNumber?: string;
  unitPrice: number;
  sold: number;
  returned: number;
  /** What can still be returned. */
  available: number;
}

// Returns some (or all) of a sale's items. Closes with the recorded return;
// the refund shown before confirming is an estimate - the server works out
// the exact discount share.
@Component({
  selector: 'app-sale-return-dialog',
  standalone: true,
  imports: [MatDialogModule, MaterialModule, FormsModule],
  templateUrl: './sale-return-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sale-return-dialog.component.scss'
})
export class SaleReturnDialogComponent {
  private readonly data = inject<{ sale: SaleResponse }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SaleReturnDialogComponent, SaleReturn>);
  private readonly saleReturnService = inject(SaleReturnService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly currencyService = inject(CurrencyService);
  private readonly languageService = inject(LanguageService);

  readonly sale = this.data.sale;
  readonly lines: ReturnLine[] = (this.sale.items ?? []).map(item => ({
    saleItemId: item.id,
    productName: item.productName,
    batchNumber: item.batchNumber,
    unitPrice: item.unitPrice,
    sold: item.quantity,
    returned: item.returnedQuantity ?? 0,
    available: item.quantity - (item.returnedQuantity ?? 0)
  }));

  readonly quantities = signal<Record<number, number>>({});
  readonly restock = signal(true);
  readonly reason = signal('');
  readonly saving = signal(false);

  readonly itemsTotal = computed(() => this.lines.reduce(
    (sum, line) => sum + line.unitPrice * (this.quantities()[line.saleItemId] ?? 0), 0));
  readonly hasItems = computed(() => this.itemsTotal() > 0);
  // Same proportion the server applies (it gives the last return the exact remainder).
  readonly estimatedRefund = computed(() => {
    const subtotal = this.sale.subtotal || 0;
    const discount = this.sale.discountAmount || 0;
    const share = subtotal > 0 ? discount * this.itemsTotal() / subtotal : 0;
    return Math.max(0, this.itemsTotal() - share);
  });

  setQuantity(line: ReturnLine, value: number | string): void {
    const quantity = Math.min(line.available, Math.max(0, Math.floor(Number(value) || 0)));
    this.quantities.update(current => ({ ...current, [line.saleItemId]: quantity }));
  }

  returnEverything(): void {
    const all: Record<number, number> = {};
    this.lines.forEach(line => all[line.saleItemId] = line.available);
    this.quantities.set(all);
  }

  formatCurrency(value: number): string {
    return this.currencyService.format(value, this.languageService.getCurrentLanguage());
  }

  confirm(): void {
    const items = this.lines
      .map(line => ({ saleItemId: line.saleItemId, quantity: this.quantities()[line.saleItemId] ?? 0 }))
      .filter(item => item.quantity > 0);
    if (!items.length || this.saving()) return;

    this.saving.set(true);
    this.saleReturnService.createReturn(this.sale.id, {
      items,
      reason: this.reason().trim() || undefined,
      restock: this.restock()
    }).subscribe({
      next: (saleReturn) => {
        this.saving.set(false);
        this.errorHandler.showSuccess('SALES.RETURN.SUCCESS',
          { params: { amount: this.formatCurrency(saleReturn.refundAmount) } });
        this.dialogRef.close(saleReturn);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorHandler.handleHttpError(err, 'SALES.RETURN.ERROR');
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
