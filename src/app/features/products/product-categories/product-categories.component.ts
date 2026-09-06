import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { CrudPageWithDialogDirective } from '../../../core/crud';
import { CategoryCrudService } from '../services/category-crud.service';
import { CategoryModel } from '../models/category.model';

@Component({
  selector: 'app-product-categories',
  standalone: true,
  imports: [FormsModule, MaterialModule, PageHeaderComponent],
  templateUrl: './product-categories.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-categories.component.scss',
})
export class ProductCategoriesComponent extends CrudPageWithDialogDirective<CategoryModel, CategoryCrudService> {
  readonly service = inject(CategoryCrudService);

  readonly displayedColumns = ['icon', 'name', 'description', 'isActive', 'actions'];
  readonly hasPagination = computed(() => this.totalElements() > this.pageSize());

  protected override getDeleteConfirmMessage(category: CategoryModel): string {
    return this.translate.instant('CATEGORIES.CONFIRM_DELETE', { name: category.name });
  }

  protected override getDeleteSuccessKey(): string {
    return 'CATEGORIES.DELETE_SUCCESS';
  }

  protected override getDeleteErrorKey(): string {
    return 'CATEGORIES.DELETE_ERROR';
  }

  protected override getDeleteMessageParams(category: CategoryModel): Record<string, unknown> {
    return { name: category.name };
  }

  toggleActive(category: CategoryModel): void {
    const updated = category.clone<CategoryModel>({ isActive: !category.isActive });
    updated.save().subscribe({
      next: () => {
        this.errorHandler.showSuccess('CATEGORIES.STATUS_UPDATED');
        this.refresh();
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'CATEGORIES.STATUS_ERROR'),
    });
  }

  getCategoryIcon(category: CategoryModel): string {
    return category.icon || 'category';
  }

  getCategoryColor(category: CategoryModel): string {
    return category.color || '#667eea';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? this.translate.instant('COMMON.ACTIVE') : this.translate.instant('COMMON.INACTIVE');
  }

  getStatusColor(isActive: boolean): 'primary' | 'warn' {
    return isActive ? 'primary' : 'warn';
  }
}
