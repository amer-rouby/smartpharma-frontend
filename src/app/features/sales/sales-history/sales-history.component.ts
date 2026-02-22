import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SalesService } from '../../../core/services/sales.service';
import { AuthService } from '../../../core/services/auth.service';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [FormsModule, RouterLink, MaterialModule, PageHeaderComponent],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss'
})
export class SalesHistoryComponent {
  private readonly salesService = inject(SalesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);

  readonly displayedColumns = ['invoiceNumber', 'date', 'items', 'total', 'paymentMethod', 'actions'];
  readonly sales = signal<any[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalElements = signal(0);

  readonly hasSales = computed(() => !this.loading() && this.sales().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.sales().length === 0);
  readonly hasPagination = computed(() => this.totalElements() > this.size());

  ngOnInit(): void {
    this.loadSales();
  }

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  loadSales(): void {
    this.loading.set(true);
    const pharmacyId = this.getPharmacyId();

    this.salesService.getAllSales(pharmacyId, this.page(), this.size()).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.sales.set(data.content || data.sales || []);
        this.totalElements.set(data.totalElements || this.sales().length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showError('SALES.LOAD_ERROR');
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.loading.set(true);
      const pharmacyId = this.getPharmacyId();

      this.salesService.searchSales(pharmacyId, query).subscribe({
        next: (response: any) => {
          const data = response.data || response;
          this.sales.set(data.content || data.sales || []);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.showError('SALES.SEARCH_ERROR');
        }
      });
    } else {
      this.loadSales();
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.loadSales();
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.size.set(event.pageSize);
    this.loadSales();
  }

  getPaymentMethodLabel(method: string): string {
    return this.translate.instant(`SALES.${method}`);
  }

  formatDate(dateString: string): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getCurrencySuffix(): string {
    return this.languageService.getCurrentLanguage() === 'ar' ? 'ج.م' : 'EGP';
  }

  private showError(key: string): void {
    this.snackBar.open(this.translate.instant(key), this.translate.instant('COMMON.CLOSE'), {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}
