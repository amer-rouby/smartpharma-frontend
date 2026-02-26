import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { Category, CategoryRequest } from '../../../core/models/category';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';

@Component({
  selector: 'app-product-categories',
  standalone: true,
  imports: [
    FormsModule,
    MaterialModule,
    PageHeaderComponent
  ],
  templateUrl: './product-categories.component.html',
  styleUrl: './product-categories.component.scss'
})
export class ProductCategoriesComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');

  readonly displayedColumns = ['icon', 'name', 'description', 'isActive', 'actions'];

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);

    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackBar.open(
          this.translate.instant('CATEGORIES.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery();

    if (query.trim()) {
      this.categoryService.searchCategories(query).subscribe({
        next: (data) => this.categories.set(data),
        error: (error) => console.error('Search error:', error)
      });
    } else {
      this.loadCategories();
    }
  }

  onAdd(): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '450px',
      data: {
        pharmacyId: this.authService.getPharmacyId(),
        mode: 'add'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  onEdit(category: Category): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '450px',
      data: {
        category: category,
        pharmacyId: category.pharmacyId,
        mode: 'edit'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  onDelete(category: Category): void {
    if (!confirm(this.translate.instant('CATEGORIES.CONFIRM_DELETE', { name: category.name }))) {
      return;
    }

    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.categories.update(cats => cats.filter(c => c.id !== category.id));
        this.snackBar.open(
          this.translate.instant('CATEGORIES.DELETE_SUCCESS', { name: category.name }),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.snackBar.open(
          this.translate.instant('CATEGORIES.DELETE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      }
    });
  }

  toggleActive(category: Category): void {
    const updated: CategoryRequest = {
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      pharmacyId: category.pharmacyId,
      isActive: !category.isActive
    };

    this.categoryService.updateCategory(category.id, updated).subscribe({
      next: (data) => {
        this.categories.update(cats =>
          cats.map(c => c.id === category.id ? data : c)
        );
        this.snackBar.open(
          this.translate.instant('CATEGORIES.STATUS_UPDATED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 2000 }
        );
      },
      error: (error) => {
        console.error('Toggle error:', error);
        this.snackBar.open(
          this.translate.instant('CATEGORIES.STATUS_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      }
    });
  }

  getCategoryIcon(category: Category): string {
    return category.icon || 'category';
  }

  getCategoryColor(category: Category): string {
    return category.color || '#667eea';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive
      ? this.translate.instant('COMMON.ACTIVE')
      : this.translate.instant('COMMON.INACTIVE');
  }

  getStatusColor(isActive: boolean): 'primary' | 'warn' {
    return isActive ? 'primary' : 'warn';
  }
}
