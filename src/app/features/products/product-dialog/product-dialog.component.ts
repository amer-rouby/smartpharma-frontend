import { Component, inject, signal, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialModule } from '../../../shared/material.module';
import { CrudDialogDirective, CrudDialogTitleKeys } from '../../../core/crud';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category';
import { LanguageService } from '../../../core/services/language.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { toLocalDateString } from '../../../core/utils/format.util';
import { ProductModel } from '../models/product.model';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './product-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-dialog.component.scss',
})
export class ProductDialogComponent extends CrudDialogDirective<ProductModel> {
  @ViewChild('barcodeInput') barcodeInputRef?: ElementRef<HTMLInputElement>;

  private readonly categoryService = inject(CategoryService);
  private readonly currencyService = inject(CurrencyService);
  readonly languageService = inject(LanguageService);

  readonly categories = signal<Category[]>([]);
  readonly categoriesLoading = signal(false);

  readonly unitTypes = [
    { value: 'BOX', label: 'PRODUCTS.UNIT_BOX' },
    { value: 'STRIP', label: 'PRODUCTS.UNIT_STRIP' },
    { value: 'TABLET', label: 'PRODUCTS.UNIT_TABLET' },
    { value: 'BOTTLE', label: 'PRODUCTS.UNIT_BOTTLE' },
    { value: 'TUBE', label: 'PRODUCTS.UNIT_TUBE' },
    { value: 'PACKET', label: 'PRODUCTS.UNIT_PACKET' }
  ];

  readonly titleKeys: CrudDialogTitleKeys = {
    create: 'PRODUCTS.ADD_NEW',
    update: 'PRODUCTS.EDIT',
    view: 'PRODUCTS.EDIT',
  };

  override afterBuildForm(): void {
    this.loadCategories();
    if (this.isCreateMode()) {
      this.generateUniqueBarcode();
      setTimeout(() => this.barcodeInputRef?.nativeElement.focus(), 0);
    }
  }

  override populateForm(): void {
    if (this.data.model && this.data.mode !== 'CREATE') {
      const m = this.data.model;
      const extra = m.extraAttributes || {};
      this.form.patchValue({
        ...m,
        manufacturer: extra['manufacturer'] || '',
        activeIngredients: extra['activeIngredients'] || '',
        description: extra['description'] || '',
        usageInstructions: extra['usageInstructions'] || '',
        storageConditions: extra['storageConditions'] || '',
        drugInteractionWarning: extra['drugInteractionWarning'] || '',
        isControlledSubstance: !!extra['isControlledSubstance'],
      });
    }
  }

  loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoryService.getActiveCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.categoriesLoading.set(false);
      },
      error: (error) => {
        this.categoriesLoading.set(false);
        this.errorHandler.handleHttpError(error, 'CATEGORIES.LOAD_ERROR');
      }
    });
  }

  generateUniqueBarcode(): void {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.form.patchValue({ barcode: `PH-${timestamp}-${random}` });
  }

  regenerateBarcode(): void {
    this.generateUniqueBarcode();
    this.errorHandler.showSuccess('PRODUCTS.BARCODE_REGENERATED');
  }

  override validate(): boolean {
    const v = this.form.value;

    if (!v.name?.trim()) {
      this.errorHandler.showWarning('VALIDATION.REQUIRED', {
        params: { field: this.translate.instant('PRODUCTS.NAME') }
      });
      return false;
    }

    if (!v.sellPrice || v.sellPrice <= 0) {
      this.errorHandler.showWarning('VALIDATION.REQUIRED', {
        params: { field: this.translate.instant('PRODUCTS.SELL_PRICE') }
      });
      return false;
    }

    if (this.isCreateMode() && v.initialStock && v.initialStock > 0 && !v.expiryDate) {
      this.errorHandler.showWarning('PRODUCTS.EXPIRY_DATE_REQUIRED_WITH_STOCK');
      return false;
    }

    return true;
  }

  override prepareModel(): ProductModel {
    const v = this.form.value;
    const extraAttributes: Record<string, unknown> = {};
    if (v.manufacturer?.trim()) extraAttributes['manufacturer'] = v.manufacturer.trim();
    if (v.activeIngredients?.trim()) extraAttributes['activeIngredients'] = v.activeIngredients.trim();
    if (v.description?.trim()) extraAttributes['description'] = v.description.trim();
    if (v.usageInstructions?.trim()) extraAttributes['usageInstructions'] = v.usageInstructions.trim();
    if (v.storageConditions?.trim()) extraAttributes['storageConditions'] = v.storageConditions.trim();
    if (v.drugInteractionWarning?.trim()) extraAttributes['drugInteractionWarning'] = v.drugInteractionWarning.trim();
    if (v.isControlledSubstance) extraAttributes['isControlledSubstance'] = true;

    return this.data.model!.clone<ProductModel>({
      name: v.name,
      scientificName: v.scientificName,
      barcode: v.barcode,
      category: v.category,
      unitType: v.unitType,
      minStockLevel: v.minStockLevel,
      prescriptionRequired: v.prescriptionRequired,
      sellPrice: v.sellPrice,
      buyPrice: v.buyPrice,
      extraAttributes,
      initialStock: this.isCreateMode() ? v.initialStock : undefined,
      expiryDate: this.isCreateMode() ? toLocalDateString(v.expiryDate) : undefined,
    });
  }

  override afterSaveSuccess(saved: ProductModel): void {
    this.errorHandler.showSuccess(this.isUpdateMode() ? 'PRODUCTS.UPDATE_SUCCESS' : 'PRODUCTS.ADD_SUCCESS');
    this.dialogRef.close(saved);
  }

  override afterSaveFail(error: unknown): void {
    this.saving.set(false);
    this.errorHandler.handleHttpError(error as HttpErrorResponse, 'COMMON.ERROR');
  }

  formatCurrency(amount: number): string {
    return this.currencyService.format(amount, this.languageService.getCurrentLanguage());
  }

  getCurrencySuffix(): string {
    return this.currencyService.getSuffix(this.languageService.getCurrentLanguage());
  }

  getCategoryName(category: Category): string {
    const categoryKeyMap: Record<string, string> = {
      'Painkillers': 'CATEGORIES.PAINKILLERS',
      'Antibiotics': 'CATEGORIES.ANTIBIOTICS',
      'Cardiovascular': 'CATEGORIES.CARDIO',
      'Digestive': 'CATEGORIES.DIGESTIVE',
      'Allergy': 'CATEGORIES.ALLERGY',
      'Vitamins': 'CATEGORIES.VITAMINS',
      'Cosmetics': 'CATEGORIES.COSMETICS',
      'Other': 'CATEGORIES.OTHER',
      'مسكنات': 'CATEGORIES.PAINKILLERS',
      'مضادات حيوية': 'CATEGORIES.ANTIBIOTICS',
      'قلب وأوعية': 'CATEGORIES.CARDIO',
      'معدة': 'CATEGORIES.DIGESTIVE',
      'حساسية': 'CATEGORIES.ALLERGY',
      'فيتامينات': 'CATEGORIES.VITAMINS',
      'مستحضرات تجميل': 'CATEGORIES.COSMETICS',
      'أخرى': 'CATEGORIES.OTHER'
    };

    const translationKey = categoryKeyMap[category.name];
    if (translationKey) {
      const translated = this.translate.instant(translationKey);
      if (translated && translated !== translationKey) {
        return translated;
      }
    }

    return category.name;
  }

  translateUnitType(key: string): string {
    return this.translate.instant(key);
  }
}
