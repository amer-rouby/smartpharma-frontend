import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductRequest } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, MaterialModule, PageHeaderComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly translate = inject(TranslateService);
  readonly languageService = inject(LanguageService);

  readonly product = signal<ProductRequest>({
    name: '',
    scientificName: '',
    barcode: '',
    category: '',
    unitType: 'BOX',
    minStockLevel: 10,
    prescriptionRequired: false,
    sellPrice: 0,
    buyPrice: 0
  });

  readonly loading = signal(false);
  readonly categoriesLoading = signal(false);
  readonly isEditMode = signal(false);
  readonly productId = signal<number | null>(null);

  readonly categories = signal<Category[]>([]);

  readonly unitTypes = [
    { value: 'BOX', label: 'PRODUCTS.UNIT_BOX' },
    { value: 'STRIP', label: 'PRODUCTS.UNIT_STRIP' },
    { value: 'TABLET', label: 'PRODUCTS.UNIT_TABLET' },
    { value: 'BOTTLE', label: 'PRODUCTS.UNIT_BOTTLE' },
    { value: 'TUBE', label: 'PRODUCTS.UNIT_TUBE' },
    { value: 'PACKET', label: 'PRODUCTS.UNIT_PACKET' }
  ];

  readonly pageTitle = computed(() =>
    this.isEditMode() ? 'PRODUCTS.EDIT' : 'PRODUCTS.ADD_NEW'
  );

  readonly pageSubtitle = computed(() =>
    this.isEditMode() ? 'PRODUCTS.EDIT_SUBTITLE' : 'PRODUCTS.ADD_SUBTITLE'
  );

  ngOnInit(): void {
    this.loadCategories();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.productId.set(+params['id']);
        this.loadProduct();
      } else {
        this.generateUniqueBarcode();
      }
    });
  }

  loadCategories(): void {
    this.categoriesLoading.set(true);

    this.categoryService.getActiveCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.categoriesLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categoriesLoading.set(false);
        this.snackBar.open(
          this.translate.instant('CATEGORIES.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      }
    });
  }

  generateUniqueBarcode(): void {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.product.update(p => ({ ...p, barcode: `PH-${timestamp}-${random}` }));
  }

  loadProduct(): void {
    const id = this.productId();
    if (!id) return;

    this.loading.set(true);
    this.productService.getProduct(id).subscribe({
      next: (response: any) => {
        const data = response.data;
        this.product.set({
          name: data.name || '',
          scientificName: data.scientificName || '',
          barcode: data.barcode || '',
          category: data.category || '',
          unitType: data.unitType || 'BOX',
          minStockLevel: data.minStockLevel || 10,
          prescriptionRequired: data.prescriptionRequired || false,
          sellPrice: data.sellPrice || 0,
          buyPrice: data.buyPrice || 0
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showError('PRODUCTS.LOAD_ERROR');
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit(): void {
    const p = this.product();

    if (!p.name?.trim()) {
      this.showError('VALIDATION.REQUIRED', { field: this.translate.instant('PRODUCTS.NAME') });
      return;
    }

    if (!p.sellPrice || p.sellPrice <= 0) {
      this.showError('VALIDATION.REQUIRED', { field: this.translate.instant('PRODUCTS.SELL_PRICE') });
      return;
    }

    this.loading.set(true);

    const request$ = this.isEditMode() && this.productId()
      ? this.productService.updateProduct(this.productId()!, p)
      : this.productService.createProduct(p);

    request$.subscribe({
      next: (response: any) => {
        this.loading.set(false);
        const msg = response.message || (this.isEditMode() ? 'PRODUCTS.UPDATE_SUCCESS' : 'PRODUCTS.ADD_SUCCESS');
        this.showSuccess(msg);
        this.router.navigate(['/products']);
      },
      error: (error: any) => {
        this.loading.set(false);
        this.showError(error.error?.message || 'COMMON.ERROR');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  regenerateBarcode(): void {
    this.generateUniqueBarcode();
    this.snackBar.open(this.translate.instant('PRODUCTS.BARCODE_REGENERATED'), this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
  }

  formatCurrency(amount: number): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  isArabic(): boolean {
    return this.languageService.getCurrentLanguage() === 'ar';
  }

  getCurrencySuffix(): string {
    return this.isArabic() ? 'ج.م' : 'EGP';
  }

  getCategoryName(category: Category): string {
    return category.name;
  }

  translateUnitType(key: string): string {
    return this.translate.instant(key);
  }

  private showSuccess(key: string, params?: any): void {
    this.snackBar.open(this.translate.instant(key, params), this.translate.instant('COMMON.CLOSE'), {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(key: string, params?: any): void {
    this.snackBar.open(this.translate.instant(key, params), this.translate.instant('COMMON.CLOSE'), {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}
