import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Category, CategoryRequest } from '../../../core/models/category';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';

@Component({
  selector: 'app-product-categories',
  standalone: true,
  imports: [
    FormsModule,
    MaterialModule,
    PageHeaderComponent,
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
  private readonly errorHandler = inject(ErrorHandlerService);

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
        this.loading.set(false);
        this.errorHandler.handleHttpError(error, 'CATEGORIES.LOAD_ERROR');
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery();

    if (query.trim()) {
      this.categoryService.searchCategories(query).subscribe({
        next: (data) => this.categories.set(data),
        error: (error) => this.errorHandler.handleHttpError(error, 'CATEGORIES.LOAD_ERROR')
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('CATEGORIES.CONFIRM_DELETE', { name: category.name }),
        confirmText: this.translate.instant('COMMON.YES'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.categoryService.deleteCategory(category.id).subscribe({
          next: () => {
            this.categories.update(cats => cats.filter(c => c.id !== category.id));
            this.errorHandler.showSuccess('CATEGORIES.DELETE_SUCCESS');
          },
          error: (error) => {
            this.errorHandler.handleHttpError(error, 'CATEGORIES.DELETE_ERROR');
          }
        });
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
        this.errorHandler.showSuccess('CATEGORIES.STATUS_UPDATED');
      },
      error: (error) => {
        this.errorHandler.handleHttpError(error, 'CATEGORIES.STATUS_ERROR');
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
