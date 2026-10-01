import { Component, Inject, inject, signal, computed, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PharmacySettingsService } from '../../../core/services/settings/pharmacy-settings.service';
import { PharmacySettings } from '../../../core/models/settings/pharmacy-settings.model';
import { InvoicePrintService, PrintableSale } from '../../../core/services/invoice-print.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LanguageService } from '../../../core/services/language.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { PharmacyContextService } from '../../../core/services/pharmacy-context.service';
import { AuthService } from '../../../core/services/auth.service';
import { SmartFeatureSettingsService } from '../../../core/services/settings/smart-feature-settings.service';
import { EInvoiceService } from '../../../core/services/einvoice.service';
import { EInvoiceSubmission } from '../../../core/models/einvoice.model';
import { SaleReturnService } from '../../../core/services/sale-return.service';
import { SalesService } from '../../../core/services/sales.service';
import { SaleReturn } from '../../../core/models/sale-return.model';
import { SaleItemResponse } from '../../../core/models/sale.model';
import { SaleReturnDialogComponent } from '../sale-return-dialog/sale-return-dialog.component';
import { toDataURL } from 'qrcode';

@Component({
  selector: 'app-sale-details-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule, TranslateModule],
  templateUrl: './sale-details-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sale-details-dialog.component.scss'
})
export class SaleDetailsDialogComponent implements OnDestroy {
  private readonly pharmacySettingsService = inject(PharmacySettingsService);
  private readonly invoicePrintService = inject(InvoicePrintService);
  private readonly translate = inject(TranslateService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly languageService = inject(LanguageService);
  private readonly currencyService = inject(CurrencyService);
  private readonly pharmacyContext = inject(PharmacyContextService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly smartFeatureSettingsService = inject(SmartFeatureSettingsService);
  private readonly eInvoiceService = inject(EInvoiceService);
  private readonly saleReturnService = inject(SaleReturnService);
  private readonly salesService = inject(SalesService);
  private readonly dialog = inject(MatDialog);

  readonly returns = signal<SaleReturn[]>([]);
  // ETA return receipts of this sale's returns, matched by saleReturnId.
  readonly returnReceipts = signal<EInvoiceSubmission[]>([]);
  readonly returnReceiptLoading = signal<number | null>(null);

  readonly pharmacySettings = signal<PharmacySettings | null>(null);
  readonly prescriptionImageBlobUrl = signal<string | null>(null);
  readonly eInvoiceEnabled = computed(() => this.smartFeatureSettingsService.flags().eInvoiceEnabled);
  readonly eInvoiceSubmission = signal<EInvoiceSubmission | null>(null);
  readonly eInvoiceLoading = signal(false);
  // QR image for the ETA receipt link, rendered locally (the content is the
  // receipt's portal URL - it's never sent to a third-party QR service).
  readonly eInvoiceQr = signal<string | null>(null);

  constructor(
    public dialogRef: MatDialogRef<SaleDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sale: any }
  ) {
    this.loadPharmacySettings();
    this.loadPrescriptionImage();
    this.loadEInvoiceStatus();
    this.loadReturns();
  }

  private loadReturns(): void {
    const saleId = this.data.sale?.id;
    if (!saleId || !(this.data.sale?.returnedAmount > 0)) return;
    this.saleReturnService.getReturns(saleId).subscribe((returns) => this.returns.set(returns));
    if (this.eInvoiceEnabled()) {
      this.eInvoiceService.getReturnsForSale(saleId).subscribe((receipts) => this.returnReceipts.set(receipts));
    }
  }

  hasReturns(): boolean {
    return this.data.sale?.returnedAmount > 0;
  }

  canReturn(): boolean {
    return (this.data.sale?.items ?? []).some((item: SaleItemResponse) => item.quantity > (item.returnedQuantity ?? 0));
  }

  openReturn(): void {
    this.dialog.open(SaleReturnDialogComponent, { data: { sale: this.data.sale }, width: '720px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((saleReturn?: SaleReturn) => {
        if (!saleReturn) return;
        // Returned quantities and the refunded total come from the server.
        this.salesService.getSaleById(this.data.sale.id).subscribe({
          next: (sale) => {
            this.data.sale = sale;
            this.loadReturns();
          },
          error: () => this.errorHandler.showError('SALES.LOAD_DETAILS_ERROR')
        });
      });
  }

  receiptFor(saleReturn: SaleReturn): EInvoiceSubmission | undefined {
    return this.returnReceipts().find((receipt) => receipt.saleReturnId === saleReturn.id);
  }

  describeItems(saleReturn: SaleReturn): string {
    const separator = this.languageService.getCurrentLanguage() === 'ar' ? '، ' : ', ';
    return saleReturn.items.map((item) => `${item.productName} × ${item.quantity}`).join(separator);
  }

  retryReturnReceipt(receipt: EInvoiceSubmission): void {
    this.returnReceiptLoading.set(receipt.id);
    this.eInvoiceService.retrySubmission(receipt.id).subscribe((updated) => {
      this.returnReceiptLoading.set(null);
      if (updated) {
        this.returnReceipts.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
      }
    });
  }

  private loadEInvoiceStatus(): void {
    if (!this.eInvoiceEnabled() || !this.data.sale?.id) return;
    this.eInvoiceService.getForSale(this.data.sale.id).subscribe((submission) => this.setSubmission(submission));
  }

  submitEInvoice(): void {
    if (!this.data.sale?.id) return;
    this.eInvoiceLoading.set(true);
    this.eInvoiceService.submit(this.data.sale.id).subscribe((submission) => {
      this.eInvoiceLoading.set(false);
      if (submission) this.setSubmission(submission);
    });
  }

  retryEInvoice(): void {
    if (!this.data.sale?.id) return;
    this.eInvoiceLoading.set(true);
    this.eInvoiceService.retry(this.data.sale.id).subscribe((submission) => {
      this.eInvoiceLoading.set(false);
      if (submission) this.setSubmission(submission);
    });
  }

  private setSubmission(submission: EInvoiceSubmission | null): void {
    this.eInvoiceSubmission.set(submission);
    if (!submission?.qrContent) {
      this.eInvoiceQr.set(null);
      return;
    }
    toDataURL(submission.qrContent, { errorCorrectionLevel: 'M', margin: 1, width: 180 })
      .then((url) => this.eInvoiceQr.set(url))
      .catch(() => this.eInvoiceQr.set(null));
  }

  getEInvoiceStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    if (status === 'ACCEPTED' || status === 'SUBMITTED') return 'primary';
    if (status === 'ERROR' || status === 'REJECTED') return 'warn';
    return 'accent';
  }

  ngOnDestroy(): void {
    const blobUrl = this.prescriptionImageBlobUrl();
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
  }

  private loadPrescriptionImage(): void {
    const relativeUrl = this.data.sale?.prescriptionImageUrl;
    if (!relativeUrl) return;

    const fullUrl = this.pharmacyContext.resolveAssetUrl(relativeUrl);
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': token ? `Bearer ${token}` : '' });

    this.http.get(fullUrl, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => this.prescriptionImageBlobUrl.set(URL.createObjectURL(blob)),
      error: () => {
        // silently skip - the invoice itself still renders without the prescription preview
      }
    });
  }

  private loadPharmacySettings(): void {
    this.pharmacySettingsService.getSettings().subscribe({
      next: (settings) => this.pharmacySettings.set(settings),
      error: (err) => {
        this.errorHandler.handleHttpError(err, 'SETTINGS.LOAD_ERROR');
        this.pharmacySettings.set(this.getDefaultPharmacyInfo());
      }
    });
  }

  private getDefaultPharmacyInfo(): PharmacySettings {
    return {
      id: 1,
      pharmacyId: 1,
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

  formatDate(dateString: string): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Date(dateString).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return this.currencyService.format(amount, this.languageService.getCurrentLanguage());
  }

  getPaymentMethodLabel(method: string): string {
    if (!method) return '-';
    const key = `SALES.PAYMENT_METHOD.${method}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : method;
  }

  printInvoice(): void {
    try {
      const sale = this.data.sale;
      const pharmacy = this.pharmacySettings() || this.getDefaultPharmacyInfo();

      if (!sale) {
        this.errorHandler.showError('SALES.PRINT_ERROR');
        return;
      }

      const printableSale: PrintableSale = {
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        transactionDate: sale.transactionDate,
        paymentMethod: sale.paymentMethod,
        totalAmount: sale.totalAmount,
        subtotal: sale.subtotal,
        discountAmount: sale.discountAmount,
        items: (sale.items || []).map((item: any) => ({
          id: item.id,
          productName: item.productName || item.product?.name || this.translate.instant('PRODUCTS.UNNAMED'),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        etaReceipt: this.eInvoiceSubmission()?.etaUuid && this.eInvoiceQr()
          ? { uuid: this.eInvoiceSubmission()!.etaUuid!, qrDataUrl: this.eInvoiceQr()! }
          : undefined
      };

      this.invoicePrintService.printInvoice(printableSale, pharmacy);
      this.errorHandler.showSuccess('SALES.PRINT_SUCCESS');
    } catch (err) {
      this.errorHandler.showError('SALES.PRINT_ERROR');
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
