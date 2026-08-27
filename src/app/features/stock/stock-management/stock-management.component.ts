import { Component, inject, signal, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, StockChangedEvent } from '../../../core/services/notification.service';
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
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PharmacyContextService } from '../../../core/services/pharmacy-context.service';

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MaterialModule,
    PageHeaderComponent,
  ],
  templateUrl: './stock-management.component.html',
  styleUrl: './stock-management.component.scss'
})
export class StockManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly stockBatchService = inject(StockBatchService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly pharmacyContext = inject(PharmacyContextService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<StockBatch>([]);
  displayedColumns: string[] = ['product', 'batch', 'quantity', 'expiry', 'status', 'actions'];

  readonly loading = signal(false);
  readonly searchQuery = signal('');
  get pharmacyId(): number {
    return this.pharmacyContext.getPharmacyId();
  }
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  ngOnInit(): void {
    this.loadStockBatches();

    // Reload data when language changes
    this.languageService.currentLang$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadStockBatches();
    });

    this.notificationService.stockChanged$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      this.applyRealtimeStockChange(event);
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyRealtimeStockChange(event: StockChangedEvent): void {
    const current = this.dataSource.data;
    const idx = current.findIndex(b => b.id === event.batch.id);

    if (event.changeType === 'DELETED') {
      if (idx > -1) {
        const updated = [...current];
        updated.splice(idx, 1);
        this.dataSource.data = updated;
        this.totalElements.update(n => Math.max(0, n - 1));
      }
      return;
    }

    if (idx > -1) {
      const updated = [...current];
      updated[idx] = { ...updated[idx], quantityCurrent: event.batch.quantityCurrent, status: event.batch.status as StockBatch['status'] };
      this.dataSource.data = updated;
    }
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
        this.showError('STOCK.LOAD_ERROR');
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
    const statusKey = status?.toUpperCase() || 'GOOD';
    const translated = this.translate.instant(`STOCK.STATUS.${statusKey}`);
    return translated !== `STOCK.STATUS.${statusKey}` ? translated : status;
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
    return new Date(dateString).toLocaleDateString(this.languageService.getCurrentLanguage() === 'ar' ? 'ar-EG' : 'en-US', {
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
      width: '520px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 48px)',
      autoFocus: false,
      panelClass: 'stock-adjustment-dialog-panel',
      data: { batch, pharmacyId: this.pharmacyId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStockBatches();
      }
    });
  }

  onDelete(batch: StockBatch): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('STOCK.DELETE_CONFIRM', { name: batch.batchNumber }),
        confirmText: this.translate.instant('COMMON.YES'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.stockBatchService.deleteBatch(batch.id, this.pharmacyId).subscribe({
          next: () => {
            this.showSuccess('STOCK.DELETE_SUCCESS');
            this.loadStockBatches();
          },
          error: () => {
            this.showError('STOCK.DELETE_ERROR');
          }
        });
      }
    });
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

  private showError(key: string): void {
    const message = this.translate.instant(key);
    this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
  }

  private showSuccess(key: string): void {
    const message = this.translate.instant(key);
    this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), { duration: 2000 });
  }
}
