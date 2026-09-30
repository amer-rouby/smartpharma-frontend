import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EInvoiceService } from '../../../core/services/einvoice.service';
import { EInvoiceSubmission } from '../../../core/models/einvoice.model';
import { SmartFeatureSettingsService } from '../../../core/services/settings/smart-feature-settings.service';

// E-receipts ETA rejected or that couldn't be issued/sent - sales and
// returns, including returns of cancelled sales, which no sales screen shows.
// Retry sends a failed one again; a rejected one is re-issued (after fixing
// the data) as a new receipt that references the rejected one.
@Component({
  selector: 'app-e-receipts-attention',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent],
  templateUrl: './e-receipts-attention.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './e-receipts-attention.component.scss'
})
export class EReceiptsAttentionComponent implements OnInit {
  private readonly eInvoiceService = inject(EInvoiceService);
  private readonly featureSettings = inject(SmartFeatureSettingsService);

  readonly enabled = computed(() => this.featureSettings.flags().eInvoiceEnabled);
  readonly receipts = signal<EInvoiceSubmission[]>([]);
  readonly loading = signal(false);
  readonly loadFailed = signal(false);
  readonly retrying = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.eInvoiceService.getNeedingAttention().subscribe((receipts) => {
      this.loading.set(false);
      this.loadFailed.set(receipts === null);
      this.receipts.set(receipts ?? []);
    });
  }

  retry(receipt: EInvoiceSubmission): void {
    this.retrying.set(receipt.id);
    this.eInvoiceService.retrySubmission(receipt.id).subscribe((updated) => {
      this.retrying.set(null);
      if (!updated) return;
      // Fixed ones leave the list; still-failing ones show their new reason.
      if (updated.status === 'ERROR' || updated.status === 'REJECTED') {
        this.receipts.update((list) => list.map((r) => (r.id === updated.id
          ? { ...updated, invoiceNumber: r.invoiceNumber, saleCancelled: r.saleCancelled }
          : r)));
      } else {
        this.receipts.update((list) => list.filter((r) => r.id !== updated.id));
      }
    });
  }

  typeKey(receipt: EInvoiceSubmission): string {
    if (receipt.documentType !== 'RETURN') return 'EINVOICE.TYPE_SALE';
    return receipt.saleReturnId ? 'EINVOICE.TYPE_PARTIAL_RETURN' : 'EINVOICE.TYPE_CANCEL_RETURN';
  }
}
