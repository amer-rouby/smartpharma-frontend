import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';
import { PharmacySettings } from '../models/settings/pharmacy-settings.model';

export interface PrintableSale {
  id: number;
  invoiceNumber: string;
  transactionDate: string;
  paymentMethod: string;
  totalAmount: number;
  subtotal?: number;
  discountAmount?: number;
  items: PrintableSaleItem[];
}

export interface PrintableSaleItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoicePrintService {
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);

  /**
   * Opens a print-ready invoice in a new window.
   * The window will auto-trigger the browser's print dialog after loading.
   */
  printInvoice(sale: PrintableSale, pharmacy: PharmacySettings): void {
    const html = this.generateInvoiceHtml(sale, pharmacy);

    // Open a blank window first, then write content
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    if (!printWindow) {
      console.error('Print window blocked - please allow pop-ups');
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content & fonts to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 600);
    };
  }

  private generateInvoiceHtml(sale: PrintableSale, pharmacy: PharmacySettings): string {
    const isArabic = this.languageService.getCurrentLanguage() === 'ar';
    const dir = isArabic ? 'rtl' : 'ltr';
    const lang = isArabic ? 'ar' : 'en';

    // Force immediate translation resolution
    const t = (key: string): string => {
      const val = this.translate.instant(key);
      return val && val !== key ? val : key;
    };

    return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${t('SALES.INVOICE_NUMBER')} #${sale.invoiceNumber}</title>
${this.getPrintStyles(isArabic)}
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="pharmacy-name">${pharmacy.pharmacyName || t('APP.NAME')}</div>
      <div class="pharmacy-info">
        ${pharmacy.address ? `<div>📍 ${pharmacy.address}</div>` : ''}
        ${pharmacy.phone ? `<div>📞 ${pharmacy.phone}</div>` : ''}
        ${pharmacy.email ? `<div>✉️ ${pharmacy.email}</div>` : ''}
      </div>
    </div>

    <div class="invoice-title">${t('SALES.INVOICE_DETAILS')}</div>

    <div class="invoice-info">
      <div class="info-box">
        <div class="info-label">${t('SALES.INVOICE_NUMBER')}</div>
        <div class="info-value">${sale.invoiceNumber}</div>
      </div>
      <div class="info-box">
        <div class="info-label">${t('SALES.DATE')}</div>
        <div class="info-value">${this.formatDate(sale.transactionDate, isArabic)}</div>
      </div>
      <div class="info-box">
        <div class="info-label">${t('SALES.PAYMENT_METHODS')}</div>
        <div class="info-value">${this.translatePaymentMethod(sale.paymentMethod)}</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>#</th>
          <th>${t('PRODUCTS.NAME')}</th>
          <th>${t('SALES.QUANTITY')}</th>
          <th>${t('SALES.UNIT_PRICE')}</th>
          <th>${t('SALES.TOTAL_PRICE')}</th>
        </tr>
      </thead>
      <tbody>
        ${sale.items.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${item.productName || t('PRODUCTS.UNNAMED')}</strong></td>
          <td>${item.quantity}</td>
          <td>${this.formatCurrency(item.unitPrice, isArabic)}</td>
          <td><strong>${this.formatCurrency(item.totalPrice, isArabic)}</strong></td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>${t('SALES.SUBTOTAL')}:</span>
        <span>${this.formatCurrency(sale.subtotal || sale.totalAmount, isArabic)}</span>
      </div>
      ${(sale.discountAmount && sale.discountAmount > 0) ? `
      <div class="total-row">
        <span>${t('SALES.DISCOUNT')}:</span>
        <span style="color: #ef4444;">-${this.formatCurrency(sale.discountAmount!, isArabic)}</span>
      </div>` : ''}
      <div class="total-row final">
        <span>${t('SALES.GRAND_TOTAL')}:</span>
        <span>${this.formatCurrency(sale.totalAmount, isArabic)}</span>
      </div>
    </div>

    <div class="footer">
      <p><strong>${t('PAYMENTS.THANK_YOU')}</strong></p>
      ${pharmacy.taxNumber ? `<p>${t('SETTINGS.TAX_NUMBER')}: ${pharmacy.taxNumber}</p>` : ''}
      ${pharmacy.phone ? `<p>${t('SETTINGS.PHARMACY_PHONE')}: ${pharmacy.phone}</p>` : ''}
      <p style="margin-top: 10px; font-size: 12px; color: #999;">
        ${t('PAYMENTS.RECEIPT_FOOTER')} - ${new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  private getPrintStyles(isArabic: boolean): string {
    const fontFamily = isArabic
      ? "'Cairo', 'Segoe UI', Tahoma, sans-serif"
      : "'Segoe UI', Roboto, Arial, sans-serif";
    const textAlign = isArabic ? 'right' : 'left';

    return `<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: ${fontFamily}; }
  body { padding: 20px; background: #fff; direction: ${isArabic ? 'rtl' : 'ltr'}; }
  .invoice-container {
    max-width: 800px; margin: 0 auto;
    border: 2px solid #667eea; border-radius: 12px; padding: 30px;
  }
  .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
  .pharmacy-name { font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #1a1a2e; }
  .pharmacy-info { font-size: 14px; color: #666; line-height: 1.8; }
  .invoice-title { font-size: 24px; color: #333; margin: 20px 0 15px; text-align: center; font-weight: bold; }
  .invoice-info {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;
  }
  .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: ${textAlign}; }
  .info-label { font-size: 12px; color: #999; margin-bottom: 5px; }
  .info-value { font-size: 15px; font-weight: bold; color: #333; }
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  .items-table thead th {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white; padding: 12px 10px; text-align: ${textAlign}; font-weight: 600; font-size: 13px;
  }
  .items-table tbody tr:nth-child(even) { background: #f8f9fa; }
  .items-table tbody tr:nth-child(odd) { background: #ffffff; }
  .items-table td { padding: 10px; border-bottom: 1px solid #e9ecef; text-align: ${textAlign}; font-size: 13px; }
  .totals { background: #f8f9fa; padding: 20px; border-radius: 8px; }
  .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; }
  .total-row.final {
    font-size: 20px; font-weight: bold; color: #667eea; padding-top: 10px;
    border-top: 2px solid #e9ecef; margin-top: 10px;
  }
  .footer {
    text-align: center; margin-top: 40px; padding-top: 20px;
    border-top: 2px solid #e9ecef; color: #666; font-size: 13px;
  }
  @media print {
    body { padding: 0; }
    .invoice-container { border: none; border-radius: 0; }
  }
</style>`;
  }

  private formatDate(dateStr: string, isArabic: boolean): string {
    const locale = isArabic ? 'ar-EG' : 'en-US';
    try {
      return new Date(dateStr).toLocaleDateString(locale, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  private translatePaymentMethod(method: string): string {
    if (!method) return '-';
    const key = `SALES.PAYMENT_METHOD.${method}`;
    const translated = this.translate.instant(key);
    if (translated && translated !== key) return translated;

    // Fallback labels for when translation key doesn't exist yet
    const fallback: Record<string, string> = {
      'CASH': 'Cash / نقدي',
      'VISA': 'Visa / فيزا',
      'MASTERCARD': 'Mastercard / ماستركارد',
      'CREDIT_CARD': 'Credit Card / بطاقة ائتمان',
      'DEBIT_CARD': 'Debit Card / بطاقة خصم',
      'ONLINE': 'Online / دفع إلكتروني',
      'INSURANCE': 'Insurance / تأمين',
      'WALLET': 'E-Wallet / محفظة إلكترونية',
      'INSTAPAY': 'InstaPay / إنستا باي',
      'FAWRY': 'Fawry / فوري',
      'BANK_TRANSFER': 'Bank Transfer / تحويل بنكي'
    };
    return fallback[method] || method;
  }

  private formatCurrency(amount: number, isArabic: boolean): string {
    const locale = isArabic ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }
}
