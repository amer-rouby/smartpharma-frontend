import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/material.module';
import { Product } from '../../../../core/models/product.model';
import { CurrencyService } from '../../../../core/services/currency.service';
import { LanguageService } from '../../../../core/services/language.service';

export interface ProductAlternativesData {
  product: Product;
  /** Same active ingredient, already sorted (in stock first, then cheapest). */
  alternatives: Product[];
}

// Lists products with the same active ingredient as the one asked for; closes
// with the product the pharmacist picked, or nothing.
@Component({
  selector: 'app-product-alternatives-dialog',
  standalone: true,
  imports: [MatDialogModule, MaterialModule],
  templateUrl: './product-alternatives-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-alternatives-dialog.component.scss'
})
export class ProductAlternativesDialogComponent {
  readonly data = inject<ProductAlternativesData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ProductAlternativesDialogComponent, Product>);
  private readonly currencyService = inject(CurrencyService);
  private readonly languageService = inject(LanguageService);

  formatCurrency(value: number): string {
    return this.currencyService.format(value, this.languageService.getCurrentLanguage());
  }

  priceDifference(alternative: Product): number {
    return (alternative.sellPrice || 0) - (this.data.product.sellPrice || 0);
  }

  // "+5.00 EGP" / "-3.50 EGP" relative to the product asked for.
  formatDifference(alternative: Product): string {
    const difference = this.priceDifference(alternative);
    return (difference > 0 ? '+' : '-') + this.formatCurrency(Math.abs(difference));
  }

  pick(alternative: Product): void {
    if (alternative.totalStock <= 0) return;
    this.dialogRef.close(alternative);
  }

  close(): void {
    this.dialogRef.close();
  }
}
