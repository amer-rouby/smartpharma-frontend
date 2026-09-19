import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, StockChangedEvent } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { StockAdjustmentDialogComponent } from '../stock-adjustment-dialog/stock-adjustment-dialog.component';
import { StockAdjustmentHistoryComponent } from '../stock-adjustment-history/stock-adjustment-history.component';
import { CrudPageWithDialogDirective } from '../../../core/crud';
import { StockBatchModel } from './models/stock-batch.model';
import { StockBatchCrudService } from './services/stock-batch-crud.service';

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PageHeaderComponent,
  ],
  templateUrl: './stock-management.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stock-management.component.scss'
})
export class StockManagementComponent extends CrudPageWithDialogDirective<StockBatchModel, StockBatchCrudService> implements OnInit, OnDestroy {
  readonly service = inject(StockBatchCrudService);
  private readonly languageService = inject(LanguageService);
  private readonly matDialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  displayedColumns: string[] = ['product', 'batch', 'quantity', 'expiry', 'status', 'actions'];

  ngOnInit(): void {
    // Reload data when language changes
    this.languageService.currentLang$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.refresh();
    });

    this.notificationService.stockChanged$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      this.applyRealtimeStockChange(event);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyRealtimeStockChange(event: StockChangedEvent): void {
    const current = this.result();
    if (!current) return;
    const idx = current.content.findIndex(b => b.id === event.batch.id);

    if (event.changeType === 'DELETED') {
      if (idx > -1) this.refresh();
      return;
    }

    if (idx > -1) {
      const updated = { ...current, content: [...current.content] };
      updated.content[idx] = Object.assign(new StockBatchModel(), updated.content[idx], {
        quantityCurrent: event.batch.quantityCurrent,
        status: event.batch.status as StockBatchModel['status']
      });
      this.result.set(updated);
    }
  }

  getStatusLabel(status: string): string {
    const statusKey = status?.toUpperCase() || 'GOOD';
    const translated = this.translate.instant(`STOCK.STATUS.${statusKey}`);
    return translated !== `STOCK.STATUS.${statusKey}` ? translated : status;
  }

  getStatusChipColor(status: string): 'primary' | 'accent' | 'warn' | '' {
    switch (status) {
      case 'ACTIVE':
      case 'GOOD': return 'primary';
      case 'LOW':
      case 'EXPIRING_SOON': return 'accent';
      case 'EXPIRED':
      case 'DISCARDED': return 'warn';
      default: return '';
    }
  }

  getQuantityChipColor(quantity: number): 'primary' | 'accent' | 'warn' | '' {
    if (quantity <= 10) return 'warn';
    if (quantity <= 20) return 'accent';
    return 'primary';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(this.languageService.getCurrentLanguage() === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onAdjust(batch: StockBatchModel): void {
    const dialogRef = this.matDialog.open(StockAdjustmentDialogComponent, {
      width: '520px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 48px)',
      autoFocus: false,
      panelClass: 'stock-adjustment-dialog-panel',
      data: { batch, pharmacyId: this.authService.getPharmacyId() ?? 1 }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refresh();
      }
    });
  }

  protected override getDeleteConfirmMessage(batch: StockBatchModel): string {
    return this.translate.instant('STOCK.DELETE_CONFIRM', { name: batch.batchNumber });
  }

  protected override getDeleteSuccessKey(): string {
    return 'STOCK.DELETE_SUCCESS';
  }

  protected override getDeleteErrorKey(): string {
    return 'STOCK.DELETE_ERROR';
  }

  onViewHistory(batch: StockBatchModel): void {
    this.matDialog.open(StockAdjustmentHistoryComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { batch: { ...batch, pharmacyId: this.authService.getPharmacyId() ?? 1 } }
    });
  }
}
