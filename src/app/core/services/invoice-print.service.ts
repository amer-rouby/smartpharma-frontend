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

  printInvoice(sale: PrintableSale, pharmacy: PharmacySettings): void {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      console.error('❌ Print window blocked');
      return;
    }

    const html = this.generateInvoiceHtml(sale, pharmacy);

    printWindow.document.write(html);
    printWindow.document.close();

    // Auto-print after content loads
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 500);
    };
  }

  private generateInvoiceHtml(sale: PrintableSale, pharmacy: PharmacySettings): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة رقم ${sale.invoiceNumber}</title>
        ${this.getPrintStyles()}
      </head>
      <body>
        <div class="invoice-container">
          ${this.getHeaderSection(pharmacy)}
          ${this.getInvoiceInfoSection(sale, pharmacy)}
          ${this.getItemsTable(sale.items)}
          ${this.getTotalsSection(sale)}
          ${this.getFooterSection(pharmacy)}
        </div>
        <script>window.onload = function() { setTimeout(() => window.print(), 500); }</script>
      </body>
      </html>
    `;
  }

  private getPrintStyles(): string {
    return `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, sans-serif; }
        body { padding: 20px; background: #fff; }
        .invoice-container { max-width: 800px; margin: 0 auto; border: 2px solid #667eea; border-radius: 12px; padding: 30px; }
        .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
        .pharmacy-name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .pharmacy-info { font-size: 14px; color: #666; line-height: 1.8; }
        .invoice-title { font-size: 24px; color: #333; margin: 20px 0 15px; }
        .invoice-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
        .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .info-label { font-size: 12px; color: #999; margin-bottom: 5px; }
        .info-value { font-size: 15px; font-weight: bold; color: #333; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { color: white; padding: 12px; text-align: right; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e9ecef; }
        .totals { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .total-row.final { font-size: 20px; font-weight: bold; color: #667eea; padding-top: 10px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e9ecef; color: #666; }
        @media print { body { padding: 0; } .invoice-container { border: none; } .no-print { display: none !important; } }
      </style>
    `;
  }

  private getHeaderSection(pharmacy: PharmacySettings): string {
    return `
      <div class="header">
        <div class="pharmacy-name">${pharmacy.pharmacyName || 'صيدليتي الذكية'}</div>
        <div class="pharmacy-info">
          ${pharmacy.address ? `<div>📍 ${pharmacy.address}</div>` : ''}
          ${pharmacy.phone ? `<div>📞 ${pharmacy.phone}</div>` : ''}
          ${pharmacy.email ? `<div>✉️ ${pharmacy.email}</div>` : ''}
        </div>
      </div>
    `;
  }

  private getInvoiceInfoSection(sale: PrintableSale, pharmacy: PharmacySettings): string {
    const date = new Date(sale.transactionDate).toLocaleDateString(this.languageService.getCurrentLanguage() === 'ar' ? 'ar-EG' : 'en-US');

    return `
      <div class="invoice-title">فاتورة مبيعات</div>
      <div class="invoice-info">
        <div class="info-box"><div class="info-label">رقم الفاتورة</div><div class="info-value">${sale.invoiceNumber}</div></div>
        <div class="info-box"><div class="info-label">التاريخ</div><div class="info-value">${date}</div></div>
        <div class="info-box"><div class="info-label">طريقة الدفع</div><div class="info-value">${this.translatePaymentMethod(sale.paymentMethod)}</div></div>
        ${pharmacy.taxNumber ? `<div class="info-box"><div class="info-label">الرقم الضريبي</div><div class="info-value">${pharmacy.taxNumber}</div></div>` : ''}
        ${pharmacy.commercialRegister ? `<div class="info-box"><div class="info-label">السجل التجاري</div><div class="info-value">${pharmacy.commercialRegister}</div></div>` : ''}
      </div>
    `;
  }

  private getItemsTable(items: PrintableSaleItem[]): string {
    return `
      <table class="items-table">
        <thead>
          <tr><th>#</th><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.productName}</td>
              <td>${item.quantity}</td>
              <td>${this.formatCurrency(item.unitPrice)}</td>
              <td>${this.formatCurrency(item.totalPrice)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private getTotalsSection(sale: PrintableSale): string {
    const subtotal = sale.subtotal || sale.totalAmount;
    const hasDiscount = sale.discountAmount && sale.discountAmount > 0;

    return `
      <div class="totals">
        <div class="total-row"><span>المجموع:</span><span>${this.formatCurrency(subtotal)}</span></div>
        ${hasDiscount ? `<div class="total-row"><span>الخصم:</span><span>-${this.formatCurrency(sale.discountAmount!)}</span></div>` : ''}
        <div class="total-row final"><span>الإجمالي النهائي:</span><span>${this.formatCurrency(sale.totalAmount)}</span></div>
      </div>
    `;
  }

  private getFooterSection(pharmacy: PharmacySettings): string {
    return `
      <div class="footer">
        <p><strong>شكراً لثقتكم بنا</strong></p>
        ${pharmacy.taxNumber ? `<p>الرقم الضريبي: ${pharmacy.taxNumber}</p>` : ''}
        ${pharmacy.phone ? `<p>للاستفسار: ${pharmacy.phone}</p>` : ''}
        <p style="margin-top: 10px; font-size: 12px; color: #999;">
          تم إصدار هذه الفاتورة إلكترونياً - ${new Date().toLocaleDateString('ar-EG')}
        </p>
      </div>
    `;
  }

  private translatePaymentMethod(method: string): string {
    const labels: Record<string, string> = {
      'CASH': 'نقدي',
      'VISA': 'فيزا',
      'MASTERCARD': 'ماستركارد',
      'CREDIT_CARD': 'بطاقة ائتمان',
      'DEBIT_CARD': 'بطاقة خصم',
      'ONLINE': 'دفع إلكتروني',
      'INSURANCE': 'تأمين',
      'WALLET': 'محفظة إلكترونية'
    };
    return labels[method] || method;
  }

  private formatCurrency(amount: number): string {
    const lang = this.languageService.getCurrentLanguage();
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }
}
