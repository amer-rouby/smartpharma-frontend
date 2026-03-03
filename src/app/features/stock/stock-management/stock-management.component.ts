import { Component, inject, signal, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';
import { StockBatchService } from '../../../core/services/stock.service';
import { StockBatch } from '../../../core/models/stock.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { StockAdjustmentDialogComponent } from '../stock-adjustment-dialog/stock-adjustment-dialog.component';
import { StockAdjustmentHistoryComponent } from '../stock-adjustment-history/stock-adjustment-history.component';

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MaterialModule, PageHeaderComponent],
  templateUrl: './stock-management.component.html',
  styleUrl: './stock-management.component.scss'
})
export class StockManagementComponent implements OnInit, AfterViewInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly stockBatchService = inject(StockBatchService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<StockBatch>([]);
  displayedColumns: string[] = ['product', 'batch', 'quantity', 'expiry', 'status', 'actions'];

  readonly loading = signal(false);
  readonly searchQuery = signal('');
  readonly pharmacyId = 4;
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  ngOnInit(): void {
    this.loadStockBatches();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadStockBatches(): void {
    this.loading.set(true);

    this.stockBatchService.getBatches(this.pharmacyId, this.currentPage(), this.pageSize()).subscribe({
      next: (response: any) => {
        const batches = this.extractBatches(response);
        const total = this.extractTotal(response);

        this.dataSource.data = batches;
        this.totalElements.set(total);

        if (this.paginator) {
          this.paginator.length = total;
          this.paginator.pageIndex = this.currentPage();
          this.paginator.pageSize = this.pageSize();
        }

        this.loading.set(false);
      },
      error: () => {
        this.showError('فشل في تحميل بيانات المخزون');
        this.loading.set(false);
      }
    });
  }

  private extractBatches(response: any): StockBatch[] {
    if (response?.content && Array.isArray(response.content)) return response.content;
    if (response?.data?.content && Array.isArray(response.data.content)) return response.data.content;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  }

  private extractTotal(response: any): number {
    if (response?.totalElements) return response.totalElements;
    if (response?.data?.totalElements) return response.data.totalElements;
    return this.dataSource.data.length;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadStockBatches();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'نشط',
      'EXPIRED': 'منتهي',
      'DISCARDED': 'ملغي',
      'GOOD': 'جيد',
      'LOW': 'منخفض',
      'EXPIRING_SOON': 'ينتهي قريباً'
    };
    return labels[status] || status;
  }

  getStatusChipColor(status: string): 'primary' | 'accent' | 'warn' | '' {
    switch (status) {
      case 'ACTIVE':
      case 'GOOD': return 'primary';
      case 'LOW':
      case 'EXPIRING_SOON': return 'accent';
      case 'EXPIRED':
      case 'DISCARDED': return 'warn';
      default: return '';
    }
  }

  getQuantityChipColor(quantity: number): 'primary' | 'accent' | 'warn' | '' {
    if (quantity <= 10) return 'warn';
    if (quantity <= 20) return 'accent';
    return 'primary';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onEdit(batch: StockBatch): void {
    this.router.navigate(['/stock', 'batches', batch.id, 'edit'], {
      queryParams: { pharmacyId: this.pharmacyId }
    });
  }

  onAdjust(batch: StockBatch): void {
    const dialogRef = this.dialog.open(StockAdjustmentDialogComponent, {
      width: '600px',
      data: { batch, pharmacyId: this.pharmacyId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStockBatches();
      }
    });
  }

  onDelete(batch: StockBatch): void {
    if (confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
      this.stockBatchService.deleteBatch(batch.id, this.pharmacyId).subscribe({
        next: () => {
          this.showSuccess('تم حذف الدفعة بنجاح');
          this.loadStockBatches();
        },
        error: () => {
          this.showError('فشل في حذف الدفعة');
        }
      });
    }
  }

  onViewHistory(batch: StockBatch): void {
    this.dialog.open(StockAdjustmentHistoryComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { batch: { ...batch, pharmacyId: this.pharmacyId } }
    });
  }

  applyFilter(): void {
    const query = this.searchQuery().trim().toLowerCase();
    this.dataSource.filter = query;
  }

  onSearch(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.applyFilter();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'إغلاق', { duration: 3000 });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'إغلاق', { duration: 2000 });
  }
}
