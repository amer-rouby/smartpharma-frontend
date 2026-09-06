import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { StockMovementService } from '../../../core/services/stock-movement.service';
import { StockMovement } from '../../../core/models/Stock-movement.model';
import { CrudPageDirective } from '../../../core/crud';
import { StockMovementCrudService } from './services/stock-movement-crud.service';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, ReactiveFormsModule],
  templateUrl: './stock-movements.component.html',
  styleUrl: './stock-movements.component.scss'
})
export class StockMovementsComponent extends CrudPageDirective<StockMovement, StockMovementCrudService> {
  readonly service = inject(StockMovementCrudService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly stockMovementService = inject(StockMovementService);

  readonly stats = signal<any>(null);

  readonly filterForm: FormGroup = this.fb.group({
    startDate: [''],
    endDate: [''],
    movementType: ['all']
  });

  readonly displayedColumns = [
    'movementType',
    'product',
    'quantity',
    'quantityChange',
    'reference',
    'movementDate',
    'userName'
  ];

  constructor() {
    super();
    this.loadStats();
  }

  protected override buildLoadOptions(page: number, size: number, search: string): Record<string, unknown> {
    const options = super.buildLoadOptions(page, size, search);

    const startDate: Date = this.filterForm.get('startDate')?.value;
    const endDate: Date = this.filterForm.get('endDate')?.value;

    if (startDate && endDate) {
      options['startDate'] = this.formatDateTimeForAPI(startDate, false);
      options['endDate'] = this.formatDateTimeForAPI(endDate, true);
      const movementType = this.filterForm.get('movementType')?.value;
      if (movementType && movementType !== 'all') {
        options['movementType'] = movementType;
      }
    }

    return options;
  }

  loadStats(): void {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const startDateStr = this.formatDateForAPI(startDate);
    const endDateStr = this.formatDateForAPI(today);

    this.stockMovementService.getStats(startDateStr, endDateStr).subscribe({
      next: (data) => this.stats.set(data),
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /** Backend's /date-range endpoint expects a full ISO date-time, not just a date. */
  private formatDateTimeForAPI(date: Date, endOfDay: boolean): string {
    const datePart = this.formatDateForAPI(date);
    return endOfDay ? `${datePart}T23:59:59` : `${datePart}T00:00:00`;
  }

  onFilter(): void {
    this.pageIndex.set(0);
    this.refresh();
  }

  resetFilters(): void {
    this.filterForm.reset({ startDate: '', endDate: '', movementType: 'all' });
    this.pageIndex.set(0);
    this.refresh();
  }

  getMovementTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'STOCK_IN': 'STOCK_MOVEMENTS.TYPE.STOCK_IN',
      'STOCK_OUT': 'STOCK_MOVEMENTS.TYPE.STOCK_OUT',
      'STOCK_ADJUSTMENT': 'STOCK_MOVEMENTS.TYPE.STOCK_ADJUSTMENT',
      'TRANSFER_IN': 'STOCK_MOVEMENTS.TYPE.TRANSFER_IN',
      'TRANSFER_OUT': 'STOCK_MOVEMENTS.TYPE.TRANSFER_OUT',
      'EXPIRED': 'STOCK_MOVEMENTS.TYPE.EXPIRED',
      'DISCARDED': 'STOCK_MOVEMENTS.TYPE.DISCARDED'
    };
    return this.translate.instant(labels[type] || type);
  }

  getMovementTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'STOCK_IN': 'add_shopping_cart',
      'STOCK_OUT': 'remove_shopping_cart',
      'STOCK_ADJUSTMENT': 'tune',
      'TRANSFER_IN': 'input',
      'TRANSFER_OUT': 'output',
      'EXPIRED': 'warning',
      'DISCARDED': 'delete'
    };
    return icons[type] || 'inventory';
  }

  getMovementTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'STOCK_IN': '#10b981',
      'STOCK_OUT': '#ef4444',
      'STOCK_ADJUSTMENT': '#f59e0b',
      'TRANSFER_IN': '#3b82f6',
      'TRANSFER_OUT': '#8b5cf6',
      'EXPIRED': '#dc2626',
      'DISCARDED': '#6b7280'
    };
    return colors[type] || '#6b7280';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('ar-EG');
  }

  formatQuantityChange(before: number, after: number): string {
    const diff = after - before;
    return diff > 0 ? `+${diff}` : `${diff}`;
  }
}
