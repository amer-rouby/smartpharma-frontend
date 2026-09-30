import { Component, Inject, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import { Category } from '../../../core/models/category';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { LanguageService } from '../../../core/services/language.service';
import { ProductPricingService } from '../services/product-pricing.service';
import {
  BulkPriceMode,
  BulkPriceUpdateRequest,
  BulkPriceUpdateResponse,
  PriceListItem
} from '../models/bulk-price.model';

// Reprices many products at once. Always previews first: Apply only sends the
// exact inputs that were previewed, and any edit clears the preview.
@Component({
  selector: 'app-bulk-price-dialog',
  standalone: true,
  imports: [MatDialogModule, MaterialModule, FormsModule],
  templateUrl: './bulk-price-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './bulk-price-dialog.component.scss'
})
export class BulkPriceDialogComponent {
  private readonly pricingService = inject(ProductPricingService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly currencyService = inject(CurrencyService);
  private readonly languageService = inject(LanguageService);

  readonly roundingSteps = [0.25, 0.5, 1];

  readonly mode = signal<BulkPriceMode>('PERCENT');
  readonly percent = signal<number | null>(null);
  readonly category = signal('');
  readonly roundTo = signal<number | null>(null);
  readonly priceListText = signal('');

  readonly loading = signal(false);
  readonly preview = signal<BulkPriceUpdateResponse | null>(null);

  // Lines that aren't "barcode,price" - reported instead of silently dropped.
  readonly parsed = computed(() => this.parsePriceList(this.priceListText()));

  readonly canPreview = computed(() => this.mode() === 'PERCENT'
    ? this.percent() !== null && this.percent() !== 0
    : this.parsed().items.length > 0);

  constructor(
    public dialogRef: MatDialogRef<BulkPriceDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: { categories: Category[] }
  ) {}

  // Any input change invalidates the preview, so Apply can't save something
  // other than what's on screen.
  changed(): void {
    this.preview.set(null);
  }

  setMode(index: number): void {
    this.mode.set(index === 0 ? 'PERCENT' : 'PRICE_LIST');
    this.changed();
  }

  runPreview(): void {
    this.send(false);
  }

  apply(): void {
    this.send(true);
  }

  close(): void {
    this.dialogRef.close(false);
  }

  categoryLabel(c: Category): string {
    return this.languageService.getCurrentLanguage() === 'ar' ? (c.nameAr || c.name) : (c.nameEn || c.name);
  }

  formatPrice(value: number): string {
    return this.currencyService.format(value, this.languageService.getCurrentLanguage());
  }

  private send(apply: boolean): void {
    const request: BulkPriceUpdateRequest = this.mode() === 'PERCENT'
      ? {
        mode: 'PERCENT',
        percent: this.percent() ?? 0,
        category: this.category() || undefined,
        roundTo: this.roundTo() ?? undefined,
        apply
      }
      : { mode: 'PRICE_LIST', items: this.parsed().items, apply };

    this.loading.set(true);
    this.pricingService.updatePrices(request).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (apply) {
          this.errorHandler.showSuccess('PRODUCTS.BULK_PRICE.APPLIED', { params: { count: result.changedCount } });
          this.dialogRef.close(true);
        } else {
          this.preview.set(result);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorHandler.handleHttpError(err, 'PRODUCTS.BULK_PRICE.ERROR');
      }
    });
  }

  // Accepts "barcode,price" per line; comma, semicolon or tab separated,
  // so a column pasted from Excel works too. A header line is skipped.
  private parsePriceList(text: string): { items: PriceListItem[]; badLines: number } {
    const items: PriceListItem[] = [];
    let badLines = 0;
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      const [code, priceText] = line.split(/[,;\t]/).map((p) => p?.trim());
      const price = Number((priceText ?? '').replace(/[^\d.]/g, ''));
      if (!code || !priceText || !Number.isFinite(price) || price <= 0) {
        badLines++;
        continue;
      }
      items.push({ barcode: code, sellPrice: price });
    }
    return { items, badLines };
  }
}
