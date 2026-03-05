import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SalesService } from '../../../core/services/sales.service';
import { AuthService } from '../../../core/services/auth.service';
import { PharmacySettingsService } from '../../../core/services/settings/pharmacy-settings.service';
import { InvoicePrintService, PrintableSale } from '../../../core/services/invoice-print.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';
import { SaleDetailsDialogComponent } from '../sale-details-dialog/sale-details-dialog.component';
import { PharmacySettings } from '../../../core/models/settings/pharmacy-settings.model';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [FormsModule, RouterLink, MaterialModule, PageHeaderComponent],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss'
})
export class SalesHistoryComponent implements OnInit {
  private readonly salesService = inject(SalesService);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly dialog = inject(MatDialog);
  private readonly pharmacySettingsService = inject(PharmacySettingsService);
  private readonly invoicePrintService = inject(InvoicePrintService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly displayedColumns = ['invoiceNumber', 'date', 'items', 'total', 'paymentMethod', 'actions'];
  readonly sales = signal<any[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalElements = signal(0);
  readonly pharmacySettings = signal<PharmacySettings | null>(null);

  readonly hasSales = computed(() => !this.loading() && this.sales().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.sales().length === 0);
  readonly hasPagination = computed(() => this.totalElements() > this.size());

  ngOnInit(): void {
    this.loadPharmacySettings();
    this.loadSales();
  }

  private loadPharmacySettings(): void {
    this.pharmacySettingsService.getSettings().subscribe({
      next: (settings) => {
        this.pharmacySettings.set(settings);
      },
      error: (err) => {
        this.errorHandler.handleHttpError(err, 'SETTINGS.LOAD_ERROR');
        this.pharmacySettings.set(this.getDefaultPharmacyInfo());
      }
    });
  }

  private getDefaultPharmacyInfo(): PharmacySettings {
    return {
      id: 1,
      pharmacyId: this.authService.getPharmacyId() || 1,
      pharmacyName: this.translate.instant('PHARMACY.DEFAULT_NAME'),
      address: '',
      phone: '',
      email: '',
      licenseNumber: '',
      taxNumber: '',
      commercialRegister: '',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      dateFormat: 'dd/MM/yyyy',
      timeFormat: '24h',
      emailNotifications: true,
      smsNotifications: true,
      lowStockAlerts: true,
      expiryAlerts: true
    };
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
      error: (err) => {
        this.loading.set(false);
        this.errorHandler.handleHttpError(err, 'SALES.LOAD_ERROR');
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
        error: (err) => {
          this.loading.set(false);
          this.errorHandler.handleHttpError(err, 'SALES.SEARCH_ERROR');
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

  onViewSale(sale: any): void {
    this.salesService.getSaleById(sale.id).subscribe({
      next: (saleDetails) => {
        this.dialog.open(SaleDetailsDialogComponent, {
          width: '800px',
          maxWidth: '95vw',
          data: { sale: saleDetails }
        });
      },
      error: (err) => {
        this.errorHandler.handleHttpError(err, 'SALES.LOAD_DETAILS_ERROR');
      }
    });
  }

  onPrintSale(sale: any): void {
    try {
      const pharmacy = this.pharmacySettings() || this.getDefaultPharmacyInfo();

      const printableSale: PrintableSale = {
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        transactionDate: sale.transactionDate,
        paymentMethod: sale.paymentMethod,
        totalAmount: sale.totalAmount,
        subtotal: sale.subtotal,
        discountAmount: sale.discountAmount,
        items: sale.items.map((item: any) => ({
          id: item.id,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      };

      this.invoicePrintService.printInvoice(printableSale, pharmacy);
      this.errorHandler.showSuccess('SALES.PRINT_SUCCESS');
    } catch (err) {
      this.errorHandler.showError('SALES.PRINT_ERROR');
    }
  }

  getPaymentMethodLabel(method: string): string {
    return this.translate.instant(`SALES.PAYMENT_METHOD.${method}`);
  }

  formatDate(dateString: string): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency', currency: 'EGP', minimumFractionDigits: 2
    }).format(amount);
  }
}
