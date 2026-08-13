import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';
import { CurrencyService } from './currency.service';

export interface PrintOptions {
  title: string;
  subtitle?: string;
  data: any[];
  columns: PrintColumn[];
  summary?: PrintSummary[];
  direction?: 'rtl' | 'ltr';
}

export interface PrintColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date';
  width?: string;
}

export interface PrintSummary {
  label: string;
  value: string | number;
  type?: 'text' | 'number' | 'currency';
}

@Injectable({
  providedIn: 'root'
})
export class PrintHelperService {
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly currencyService = inject(CurrencyService);

  /**
   * Opens a print-ready window with the report data.
   * Uses browser's native print dialog - no download, no backend PDF.
   */
  printReport(options: PrintOptions): void {
    const isArabic = this.languageService.getCurrentLanguage() === 'ar';
    const dir = options.direction || (isArabic ? 'rtl' : 'ltr');
    const lang = isArabic ? 'ar' : 'en';

    const t = (key: string): string => {
      const val = this.translate.instant(key);
      return val && val !== key ? val : key;
    };

    const html = this.generatePrintHtml(options, t, isArabic, dir, lang);

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);

    // Write content to iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Wait for content to load, then print
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print();
          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 100);
        }, 300);
      };
    }
  }

  private generatePrintHtml(
    options: PrintOptions,
    t: (key: string) => string,
    isArabic: boolean,
    dir: string,
    lang: string
  ): string {
    const fontFamily = isArabic
      ? "'Cairo', 'Segoe UI', Tahoma, sans-serif"
      : "'Segoe UI', Roboto, Arial, sans-serif";
    const textAlign = isArabic ? 'right' : 'left';

    const summaryHtml = options.summary?.length ? `
      <div class="summary-section">
        <h3>${t('REPORTS.SUMMARY') || 'Summary'}</h3>
        <div class="summary-grid">
          ${options.summary.map(item => `
            <div class="summary-item">
              <div class="summary-label">${item.label}</div>
              <div class="summary-value">${this.formatValue(item.value, item.type || 'text', isArabic)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    const tableHtml = options.data.length > 0 ? `
      <table class="data-table">
        <thead>
          <tr>
            ${options.columns.map(col => `
              <th style="${col.width ? `width: ${col.width}` : ''}">${col.label}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${options.data.map((row, index) => `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
              ${options.columns.map(col => `
                <td>${this.formatValue(row[col.key], col.type || 'text', isArabic)}</td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : `
      <div class="no-data">
        <p>${t('REPORTS.NO_DATA') || 'No data available'}</p>
      </div>
    `;

    return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${options.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: ${fontFamily}; }
    body { padding: 30px; background: #fff; direction: ${dir}; }
    .report-container { max-width: 900px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
    .report-title { font-size: 28px; font-weight: bold; color: #1a1a2e; margin-bottom: 10px; }
    .report-subtitle { font-size: 14px; color: #666; }
    .report-date { font-size: 12px; color: #999; margin-top: 5px; }
    ${summaryHtml}
    .table-section { margin-top: 30px; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .data-table thead th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; padding: 14px 12px; text-align: ${textAlign}; font-weight: 600; font-size: 13px;
    }
    .data-table tbody tr:nth-child(even) { background: #f8f9fa; }
    .data-table tbody tr:nth-child(odd) { background: #ffffff; }
    .data-table td { padding: 12px; border-bottom: 1px solid #e9ecef; text-align: ${textAlign}; font-size: 13px; }
    .data-table tbody tr:hover { background: #e3f2fd; }
    .no-data { text-align: center; padding: 40px; color: #999; font-size: 14px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e9ecef; color: #666; font-size: 12px; }
    @media print {
      body { padding: 0; }
      .report-container { max-width: 100%; }
      .data-table tbody tr:hover { background: inherit; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div class="report-title">${options.title}</div>
      ${options.subtitle ? `<div class="report-subtitle">${options.subtitle}</div>` : ''}
      <div class="report-date">${t('REPORTS.GENERATED') || 'Generated'}: ${new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
    </div>

    ${summaryHtml}
    <div class="table-section">
      ${tableHtml}
    </div>

    <div class="footer">
      <p>${t('APP.NAME')} - ${t('FOOTER.COPYRIGHT')}</p>
    </div>
  </div>
</body>
</html>`;
  }

  private formatValue(value: any, type: string, isArabic: boolean): string {
    if (value === null || value === undefined) return '-';

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
          style: 'currency',
          currency: this.currencyService.getCode(),
          minimumFractionDigits: 2
        }).format(value);

      case 'number':
        return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format(value);

      case 'date':
        try {
          return new Date(value).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          });
        } catch {
          return value;
        }

      default:
        return value;
    }
  }
}
