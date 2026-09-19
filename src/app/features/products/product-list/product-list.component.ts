import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category';
import { MaterialModule } from '../../../shared/material.module';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ProductDetailsDialogComponent } from '../product-details-dialog/product-details-dialog.component';
import { CrudPageWithDialogDirective } from '../../../core/crud';
import { ProductModel } from '../models/product.model';
import { ProductCrudService } from '../services/product-crud.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, MaterialModule, FormsModule, PageHeaderComponent],
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent extends CrudPageWithDialogDirective<ProductModel, ProductCrudService> implements OnInit {
  readonly service = inject(ProductCrudService);
  private readonly categoryService = inject(CategoryService);
  private readonly languageService = inject(LanguageService);
  private readonly currencyService = inject(CurrencyService);
  private readonly matDialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly selectedCategory = signal('all');
  readonly categoryOptions = signal<Category[]>([]);
  readonly categorySearchText = signal('');
  readonly filteredCategoryOptions = computed(() => {
    const q = this.categorySearchText().trim().toLowerCase();
    const opts = this.categoryOptions();
    if (!q) return opts;
    return opts.filter(c =>
      (c.nameAr || '').toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  });

  readonly displayedColumns = ['name', 'barcode', 'category', 'stock', 'price', 'actions'];
  readonly hasPagination = computed(() => this.totalElements() > this.pageSize());
  readonly hasProducts = computed(() => !this.loading() && this.models().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.models().length === 0);

  protected override buildLoadOptions(page: number, size: number, search: string): Record<string, unknown> {
    const options = super.buildLoadOptions(page, size, search);
    options['sortBy'] = 'name';
    options['sortDirection'] = 'asc';
    if (this.selectedCategory() !== 'all') options['category'] = this.selectedCategory();
    return options;
  }

  ngOnInit(): void {
    this.loadCategoryOptions();

    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q');
      if (q) {
        this.searchQuery.set(q);
      }
      if (params.get('action') === 'new') {
        this.router.navigate([], { queryParams: { action: null }, queryParamsHandling: 'merge' });
        this.openCreateDialog();
      }
    });
  }

  private loadCategoryOptions(): void {
    this.categoryService.getActiveCategories().subscribe({
      next: (data) => this.categoryOptions.set(data),
      error: () => {}
    });
  }

  filterByCategory(): void {
    this.pageIndex.set(0);
    this.refresh();
  }

  onCategorySelected(value: string): void {
    this.selectedCategory.set(value);
    if (value === 'all') {
      this.categorySearchText.set('');
    } else {
      const opt = this.categoryOptions().find(c => c.name === value);
      this.categorySearchText.set(opt?.nameAr || opt?.name || value);
    }
    this.filterByCategory();
  }

  clearCategoryFilter(): void {
    this.onCategorySelected('all');
  }

  viewDetails(product: ProductModel): void {
    this.matDialog.open(ProductDetailsDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { product }
    }).afterClosed().subscribe(result => {
      if (result?.edit) {
        this.openUpdateDialog(product);
      }
    });
  }

  protected override getDeleteConfirmMessage(product: ProductModel): string {
    return this.translate.instant('PRODUCTS.DELETE_CONFIRM', { name: product.name });
  }

  protected override getDeleteSuccessKey(): string {
    return 'PRODUCTS.DELETE_SUCCESS';
  }

  protected override getDeleteErrorKey(): string {
    return 'COMMON.ERROR';
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
    this.pageIndex.set(0);
  }

  formatCurrency(amount: number): string {
    return this.currencyService.format(amount, this.languageService.getCurrentLanguage());
  }

  getCurrencySuffix(): string {
    return this.currencyService.getSuffix(this.languageService.getCurrentLanguage());
  }

  translateCategory(key: string): string {
    return this.translate.instant(key);
  }
}
