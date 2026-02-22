import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';

interface StockBatch {
  id: number;
  productName: string;
  batchNumber: string;
  quantityCurrent: number;
  expiryDate: string;
  status: 'GOOD' | 'LOW' | 'EXPIRED' | 'EXPIRING_SOON';
}

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [RouterLink, FormsModule, MaterialModule, PageHeaderComponent],
  templateUrl: './stock-management.component.html',
  styleUrl: './stock-management.component.scss'
})
export class StockManagementComponent {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);

  readonly displayedColumns = ['product', 'batch', 'quantity', 'expiry', 'status', 'actions'];
  readonly stockBatches = signal<StockBatch[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');

  readonly hasStock = computed(() => !this.loading() && this.stockBatches().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.stockBatches().length === 0);

  constructor() {
    this.loadStockBatches();
  }

  loadStockBatches(): void {
    this.loading.set(true);

    // ✅ Demo data للـ testing
    setTimeout(() => {
      this.stockBatches.set(this.getDemoData());
      this.loading.set(false);
    }, 500);
  }

  getStatusLabel(status: string): string {
    return this.translate.instant(`STOCK.STATUS_${status}`);
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    const colors: Record<string, 'primary' | 'accent' | 'warn'> = {
      'GOOD': 'primary',
      'LOW': 'accent',
      'EXPIRED': 'warn',
      'EXPIRING_SOON': 'warn'
    };
    return colors[status] || 'primary';
  }

  getStockChipColor(quantity: number): 'primary' | 'accent' | 'warn' {
    if (quantity <= 10) return 'warn';
    if (quantity <= 20) return 'accent';
    return 'primary';
  }

  formatDate(dateString: string): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onEdit(batch: StockBatch): void {
    this.snackBar.open(
      `${this.translate.instant('STOCK.EDIT_BATCH')}: ${batch.productName}`,
      this.translate.instant('COMMON.CLOSE'),
      { duration: 2000 }
    );
  }

  onAdjust(batch: StockBatch): void {
    this.snackBar.open(
      `${this.translate.instant('STOCK.ADJUST')}: ${batch.productName}`,
      this.translate.instant('COMMON.CLOSE'),
      { duration: 2000 }
    );
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.loading.set(true);
      setTimeout(() => {
        const filtered = this.getDemoData().filter(item =>
          item.productName.toLowerCase().includes(query.toLowerCase()) ||
          item.batchNumber.toLowerCase().includes(query.toLowerCase())
        );
        this.stockBatches.set(filtered);
        this.loading.set(false);
      }, 300);
    } else {
      this.loadStockBatches();
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.loadStockBatches();
  }

  private getDemoData(): StockBatch[] {
    return [
      { id: 1, productName: 'بنادول إكسترا', batchNumber: 'BN-2024-001', quantityCurrent: 150, expiryDate: '2025-12-01', status: 'GOOD' },
      { id: 2, productName: 'أوجمنت 1 جم', batchNumber: 'AG-2024-002', quantityCurrent: 8, expiryDate: '2025-06-15', status: 'LOW' },
      { id: 3, productName: 'كونكور 5 مجم', batchNumber: 'CN-2024-003', quantityCurrent: 200, expiryDate: '2025-03-01', status: 'EXPIRING_SOON' },
      { id: 4, productName: 'أوميبرازول 20 مجم', batchNumber: 'OM-2024-004', quantityCurrent: 5, expiryDate: '2024-01-15', status: 'EXPIRED' },
      { id: 5, productName: 'فولتارين 50 مجم', batchNumber: 'VL-2024-005', quantityCurrent: 100, expiryDate: '2026-08-20', status: 'GOOD' }
    ];
  }
}
