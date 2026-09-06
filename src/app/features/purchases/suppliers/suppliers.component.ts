import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { CrudPageWithDialogDirective } from '../../../core/crud';
import { DemandPredictionService, SupplierReorderGroup } from '../../../core/services/demand-prediction.service';
import { SupplierCrudService } from './services/supplier-crud.service';
import { SupplierModel } from './models/supplier.model';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, MatTableModule],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss',
})
export class SuppliersComponent extends CrudPageWithDialogDirective<SupplierModel, SupplierCrudService> {
  readonly service = inject(SupplierCrudService);
  private readonly router = inject(Router);
  private readonly predictionService = inject(DemandPredictionService);

  readonly displayedColumns = ['name', 'contactPerson', 'phone', 'email', 'city', 'status', 'actions'];
  readonly hasPagination = computed(() => this.totalElements() > this.pageSize());

  readonly recommendationGroups = signal<SupplierReorderGroup[]>([]);
  readonly recommendationsLoading = signal(false);
  readonly recommendationsLoaded = signal(false);

  onTabChange(index: number): void {
    if (index === 1 && !this.recommendationsLoaded()) {
      this.loadRecommendations();
    }
  }

  loadRecommendations(): void {
    this.recommendationsLoading.set(true);
    this.predictionService.getReorderRecommendationsBySupplier().subscribe({
      next: (data) => {
        this.recommendationGroups.set(data);
        this.recommendationsLoaded.set(true);
        this.recommendationsLoading.set(false);
      },
      error: () => {
        this.recommendationsLoading.set(false);
      },
    });
  }

  onReviewRecommendation(rec: { productId: number; recommendedQuantity: number; supplierId: number | null; predictionId: number }): void {
    this.router.navigate(['/purchases/new'], {
      queryParams: {
        productId: rec.productId,
        quantity: rec.recommendedQuantity,
        supplierId: rec.supplierId ?? undefined,
        predictionId: rec.predictionId,
        source: 'prediction',
      },
    });
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      HIGH: '#ef4444',
      MEDIUM: '#f59e0b',
      LOW: '#10b981',
    };
    return colors[priority] || '#6b7280';
  }

  protected override getDeleteConfirmMessage(supplier: SupplierModel): string {
    return this.translate.instant('SUPPLIERS.CONFIRM_DELETE', { name: supplier.name });
  }

  protected override getDeleteSuccessKey(): string {
    return 'SUPPLIERS.DELETE_SUCCESS';
  }

  protected override getDeleteErrorKey(): string {
    return 'SUPPLIERS.DELETE_ERROR';
  }

  toggleStatus(supplier: SupplierModel): void {
    const newStatus = supplier.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = supplier.clone<SupplierModel>({ status: newStatus });
    updated.save().subscribe({
      next: () => {
        this.errorHandler.showSuccess('SUPPLIERS.STATUS_UPDATED');
        this.refresh();
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'SUPPLIERS.STATUS_ERROR'),
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'COMMON.ACTIVE',
      INACTIVE: 'COMMON.INACTIVE',
      BLOCKED: 'COMMON.BLOCKED',
    };
    return this.translate.instant(labels[status] || status);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      ACTIVE: '#10b981',
      INACTIVE: '#6b7280',
      BLOCKED: '#ef4444',
    };
    return colors[status] || '#6b7280';
  }
}
