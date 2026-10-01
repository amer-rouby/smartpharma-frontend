import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { MaterialModule } from '../../../../shared/material.module';
import { OfflineSalesService, QueuedSale } from '../../../../core/services/offline-sales.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { LanguageService } from '../../../../core/services/language.service';

// The POS's offline status: shown while offline, while sales wait to sync,
// or when the product list came from the copy saved on this device. Sales
// the server refused stay listed here to retry or discard.
@Component({
  selector: 'app-offline-queue-banner',
  standalone: true,
  imports: [MaterialModule, DatePipe],
  templateUrl: './offline-queue-banner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './offline-queue-banner.component.scss'
})
export class OfflineQueueBannerComponent {
  readonly offline = inject(OfflineSalesService);
  private readonly translate = inject(TranslateService);
  private readonly currencyService = inject(CurrencyService);
  private readonly languageService = inject(LanguageService);

  /** When the product list in use was saved on this device; null when it's live. */
  readonly catalogSavedAt = input<string | null>(null);

  formatCurrency(value: number): string {
    return this.currencyService.format(value, this.languageService.getCurrentLanguage());
  }

  failureReason(sale: QueuedSale): string {
    if (sale.errorCode) {
      const key = `ERRORS.${sale.errorCode}`;
      const translated = this.translate.instant(key);
      if (translated !== key) return translated;
    }
    return sale.errorMessage || this.translate.instant('SALES.CREATE_ERROR');
  }

  retryQueuedSale(clientSaleId: string): void {
    void this.offline.retry(clientSaleId);
  }

  async discardQueuedSale(clientSaleId: string): Promise<void> {
    const result = await Swal.fire({
      icon: 'warning',
      title: this.translate.instant('SALES.OFFLINE.DISCARD_TITLE'),
      text: this.translate.instant('SALES.OFFLINE.DISCARD_TEXT'),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('SALES.OFFLINE.DISCARD'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
      confirmButtonColor: '#dc2626'
    });
    if (result.isConfirmed) {
      await this.offline.discard(clientSaleId);
    }
  }
}
