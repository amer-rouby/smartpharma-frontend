import { Component, inject, signal, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';
import { StockBatchService } from '../../../core/services/stock.service';
import { StockBatch } from '../../../core/models/stock.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MaterialModule,
    PageHeaderComponent
  ],
  templateUrl: './stock-management.component.html',
  styleUrl: './stock-management.component.scss'
})
export class StockManagementComponent implements OnInit, AfterViewInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly stockBatchService = inject(StockBatchService);
  private readonly router = inject(Router);

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
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }, 100);
  }

  loadStockBatches(): void {
    this.loading.set(true);

    this.stockBatchService.getBatches(this.pharmacyId, this.currentPage(), this.pageSize()).subscribe({
      next: (response: any) => {
        let batches: StockBatch[] = [];
        let total = 0;

        if (response?.content && Array.isArray(response.content)) {
          batches = response.content;
          total = response.totalElements || response.content.length;
        } else if (response?.data?.content && Array.isArray(response.data.content)) {
          batches = response.data.content;
          total = response.data.totalElements || response.data.content.length;
        } else if (response?.data && Array.isArray(response.data)) {
          batches = response.data;
          total = response.data.length;
        } else if (Array.isArray(response)) {
          batches = response;
          total = response.length;
        }

        this.dataSource.data = batches;
        this.totalElements.set(total);

        if (this.paginator) {
          this.paginator.length = total;
          this.paginator.pageIndex = this.currentPage();
          this.paginator.pageSize = this.pageSize();
        }

        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.snackBar.open('فشل في تحميل بيانات المخزون', 'إغلاق', { duration: 3000 });
        this.loading.set(false);
      }
    });
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
      case 'GOOD':
        return 'primary';
      case 'LOW':
      case 'EXPIRING_SOON':
        return 'accent';
      case 'EXPIRED':
      case 'DISCARDED':
        return 'warn';
      default:
        return '';
    }
  }

  getQuantityChipColor(quantity: number): 'primary' | 'accent' | 'warn' | '' {
    if (quantity <= 10) return 'warn';
    if (quantity <= 20) return 'accent';
    return 'primary';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onEdit(batch: StockBatch): void {
    this.router.navigate(['/stock', 'batches', batch.id, 'edit']);
  }

  onAdjust(batch: StockBatch): void {
    this.snackBar.open(`تعديل مخزون: ${batch.batchNumber}`, 'إغلاق', { duration: 2000 });
  }

  onDelete(batch: StockBatch): void {
    if (confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
      this.stockBatchService.deleteBatch(batch.id).subscribe({
        next: () => {
          this.snackBar.open('تم حذف الدفعة بنجاح', 'إغلاق', { duration: 2000 });
          this.loadStockBatches();
        },
        error: (error: unknown) => {
          this.snackBar.open('فشل في حذف الدفعة', 'إغلاق', { duration: 3000 });
        }
      });
    }
  }

  applyFilter(): void {
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      this.dataSource.filter = query;
    } else {
      this.dataSource.filter = '';
    }
  }

  onSearch(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.applyFilter();
  }
}
