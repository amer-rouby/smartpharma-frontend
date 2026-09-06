import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AuthService } from '../../../core/services/auth.service';
import { PharmacySettingsService } from '../../../core/services/settings/pharmacy-settings.service';
import { InvoicePrintService, PrintableSale } from '../../../core/services/invoice-print.service';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { SaleDetailsDialogComponent } from '../sale-details-dialog/sale-details-dialog.component';
import { PharmacySettings } from '../../../core/models/settings/pharmacy-settings.model';
import { SaleResponse } from '../../../core/models/sale.model';
import { CrudPageDirective } from '../../../core/crud';
import { SaleCrudService } from './services/sale-crud.service';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [FormsModule, RouterLink, MaterialModule, PageHeaderComponent],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss'
})
export class SalesHistoryComponent extends CrudPageDirective<SaleResponse, SaleCrudService> {
  readonly service = inject(SaleCrudService);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly currencyService = inject(CurrencyService);
  private readonly dialog = inject(MatDialog);
  private readonly pharmacySettingsService = inject(PharmacySettingsService);
  private readonly invoicePrintService = inject(InvoicePrintService);

  readonly displayedColumns = ['invoiceNumber', 'date', 'items', 'total', 'paymentMethod', 'actions'];
  readonly pharmacySettings = signal<PharmacySettings | null>(null);

  readonly hasSales = computed(() => !this.loading() && this.models().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.models().length === 0);
  readonly hasPagination = computed(() => this.totalElements() > this.pageSize());

  constructor() {
    super();
    this.loadPharmacySettings();
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
      timeFormat: '24h'
    };
  }

  onViewSale(sale: SaleResponse): void {
    this.service.getById(sale.id).subscribe({
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

  onPrintSale(sale: SaleResponse): void {
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
        items: (sale.items || []).map((item) => ({
          id: item.id,
          productName: item.productName || this.translate.instant('PRODUCTS.UNNAMED'),
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
    return this.currencyService.format(amount, this.languageService.getCurrentLanguage());
  }
}
