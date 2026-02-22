import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';

interface Category {
  id: number;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  productCount: number;
  color: string;
}

@Component({
  selector: 'app-product-categories',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent],
  templateUrl: './product-categories.component.html',
  styleUrl: './product-categories.component.scss'
})
export class ProductCategoriesComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);

  readonly displayedColumns = signal(['icon', 'name', 'description', 'productCount', 'actions']);

  readonly categories = signal<Category[]>([
    { id: 1, nameKey: 'CATEGORIES.PAINKILLERS', descriptionKey: 'CATEGORIES.PAINKILLERS_DESC', icon: 'healing', productCount: 25, color: '#667eea' },
    { id: 2, nameKey: 'CATEGORIES.ANTIBIOTICS', descriptionKey: 'CATEGORIES.ANTIBIOTICS_DESC', icon: 'coronavirus', productCount: 18, color: '#764ba2' },
    { id: 3, nameKey: 'CATEGORIES.CARDIO', descriptionKey: 'CATEGORIES.CARDIO_DESC', icon: 'favorite', productCount: 12, color: '#f093fb' },
    { id: 4, nameKey: 'CATEGORIES.DIGESTIVE', descriptionKey: 'CATEGORIES.DIGESTIVE_DESC', icon: 'water_drop', productCount: 15, color: '#f5576c' },
    { id: 5, nameKey: 'CATEGORIES.ALLERGY', descriptionKey: 'CATEGORIES.ALLERGY_DESC', icon: 'allergy', productCount: 10, color: '#4facfe' },
    { id: 6, nameKey: 'CATEGORIES.VITAMINS', descriptionKey: 'CATEGORIES.VITAMINS_DESC', icon: 'local_pharmacy', productCount: 20, color: '#43e97b' }
  ]);

  onEdit(category: Category): void {
    const name = this.translate.instant(category.nameKey);
    this.snackBar.open(this.translate.instant('CATEGORIES.EDIT_SUCCESS', { name }), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
  }

  onDelete(category: Category): void {
    const name = this.translate.instant(category.nameKey);
    this.snackBar.open(this.translate.instant('CATEGORIES.DELETE_SUCCESS', { name }), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
  }

  onAdd(): void {
    this.snackBar.open(this.translate.instant('CATEGORIES.ADD_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
  }

  getCategoryName(category: Category): string {
    return this.translate.instant(category.nameKey);
  }

  getCategoryDescription(category: Category): string {
    return this.translate.instant(category.descriptionKey);
  }

  getProductsLabel(count: number): string {
    return this.translate.instant('CATEGORIES.PRODUCT_COUNT', { count });
  }
}
