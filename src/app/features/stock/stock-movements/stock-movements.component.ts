import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { StockMovementService } from '../../../core/services/stock-movement.service';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, ReactiveFormsModule],
  templateUrl: './stock-movements.component.html',
  styleUrl: './stock-movements.component.scss'
})
export class StockMovementsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly stockMovementService = inject(StockMovementService);

  readonly loading = signal(false);
  readonly movements = signal<any[]>([]);
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

  ngOnInit(): void {
    this.loadMovements();
    this.loadStats();
  }

  loadMovements(): void {
    this.loading.set(true);

    this.stockMovementService.getMovements().subscribe({
      next: (data) => {
        this.movements.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading movements:', error);
        this.snackBar.open(
          this.translate.instant('STOCK_MOVEMENTS.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split('T')[0];

    this.stockMovementService.getStats(startDateStr, today).subscribe({
      next: (data) => {
        this.stats.set(data);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  onFilter(): void {
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    const movementType = this.filterForm.get('movementType')?.value;

    if (startDate && endDate) {
      this.loading.set(true);

      this.stockMovementService.getMovementsByDateRange(startDate, endDate).subscribe({
        next: (data) => {
          let filtered = data;

          if (movementType !== 'all') {
            filtered = data.filter(m => m.movementType === movementType);
          }

          this.movements.set(filtered);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error filtering movements:', error);
          this.loading.set(false);
        }
      });
    } else {
      this.loadMovements();
    }
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
