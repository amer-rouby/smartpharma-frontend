import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { MaterialModule } from '../../../shared/material.module';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, MaterialModule, FormsModule, PageHeaderComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly dialog = inject(MatDialog);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('all');
  readonly categories = signal<string[]>(['all']);

  readonly displayedColumns = ['name', 'barcode', 'category', 'stock', 'price', 'actions'];

  readonly filteredProducts = computed(() => {
    const category = this.selectedCategory();
    if (category === 'all') return this.products();
    return this.products().filter(p => p.category === category);
  });

  readonly hasProducts = computed(() => !this.loading() && this.filteredProducts().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.filteredProducts().length === 0);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        this.products.set(response.data || []);
        this.extractCategories();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showError('PRODUCTS.LOAD_ERROR');
      }
    });
  }

  extractCategories(): void {
    const cats = new Set<string>();
    this.products().forEach(p => {
      if (p.category) cats.add(p.category);
    });
    this.categories.set(['all', ...Array.from(cats)]);
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.productService.searchProducts(query).subscribe({
        next: (response: any) => this.products.set(response.data || [])
      });
    } else {
      this.loadProducts();
    }
  }

  filterByCategory(): void {
    if (this.selectedCategory() === 'all') {
      this.loadProducts();
    }
  }

  onDelete(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('PRODUCTS.DELETE_CONFIRM', { name: product.name }),
        confirmText: this.translate.instant('COMMON.YES'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.loadProducts();
            this.showSuccess('PRODUCTS.DELETE_SUCCESS');
          },
          error: () => this.showError('COMMON.ERROR')
        });
      }
    });
  }

  getStockColor(stock: number): 'primary' | 'accent' | 'warn' {
    if (stock <= 10) return 'warn';
    if (stock <= 20) return 'accent';
    return 'primary';
  }

  getStockStatus(stock: number): string {
    if (stock <= 10) return this.translate.instant('PRODUCTS.LOW_STOCK');
    if (stock <= 20) return this.translate.instant('PRODUCTS.AVERAGE_STOCK');
    return this.translate.instant('PRODUCTS.GOOD_STOCK');
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.loadProducts();
  }

  formatCurrency(amount: number): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getCurrencySuffix(): string {
    return this.languageService.getCurrentLanguage() === 'ar' ? 'ج.م' : 'EGP';
  }

  translateCategory(key: string): string {
    return this.translate.instant(key);
  }

  private showSuccess(key: string): void {
    this.snackBar.open(this.translate.instant(key), this.translate.instant('COMMON.CLOSE'), {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(key: string): void {
    this.snackBar.open(this.translate.instant(key), this.translate.instant('COMMON.CLOSE'), {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}
