import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CurrencyService } from '../../../core/services/currency.service';
import { MatDialog } from '@angular/material/dialog';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models/payment.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { RefundFormComponent } from '../refund-form/refund-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { CrudPageDirective } from '../../../core/crud';
import { PaymentCrudService } from './services/payment-crud.service';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    TranslateModule,
    PageHeaderComponent
  ],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss'
})
export class PaymentHistoryComponent extends CrudPageDirective<Payment, PaymentCrudService> implements OnInit {
  readonly service = inject(PaymentCrudService);
  private readonly paymentService = inject(PaymentService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly currencyService = inject(CurrencyService);

  readonly filterForm: FormGroup;
  displayedColumns = ['referenceNumber', 'amount', 'paymentMethod', 'status', 'actions'];

  constructor() {
    super();
    this.filterForm = this.fb.group({
      status: [''],
      paymentMethod: ['']
    });
  }

  protected override buildLoadOptions(page: number, size: number, search: string): Record<string, unknown> {
    const options = super.buildLoadOptions(page, size, search);
    const status = this.filterForm.get('status')?.value;
    const paymentMethod = this.filterForm.get('paymentMethod')?.value;
    if (status) options['status'] = status;
    if (paymentMethod) options['paymentMethod'] = paymentMethod;
    return options;
  }

  ngOnInit(): void {
    this.filterForm.get('status')?.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.refresh();
    });

    this.filterForm.get('paymentMethod')?.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.refresh();
    });
  }

  async onRefund(payment: Payment): Promise<void> {
    if (!payment.referenceNumber) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: false,
      data: {
        title: this.translate.instant('PAYMENTS.CONFIRM_REFUND_TITLE'),
        message: this.translate.instant('PAYMENTS.CONFIRM_REFUND_TEXT', { amount: payment.amount }),
        confirmText: this.translate.instant('COMMON.CONFIRM'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        icon: 'refund'
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        const refundDialogRef = this.dialog.open(RefundFormComponent, {
          width: '500px',
          data: {
            paymentReference: payment.referenceNumber,
            maxAmount: payment.amount
          }
        });

        refundDialogRef.afterClosed().subscribe((success) => {
          if (success) {
            this.errorHandler.showSuccess('PAYMENTS.REFUND_SUCCESS');
            this.refresh();
          }
        });
      }
    });
  }

  async onCancel(payment: Payment): Promise<void> {
    if (!payment.referenceNumber) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: false,
      data: {
        title: this.translate.instant('PAYMENTS.CONFIRM_CANCEL_TITLE'),
        message: this.translate.instant('PAYMENTS.CONFIRM_CANCEL_TEXT'),
        confirmText: this.translate.instant('COMMON.CONFIRM'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        icon: 'cancel'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.paymentService.cancelPayment(payment.referenceNumber).subscribe({
          next: () => {
            this.errorHandler.showSuccess('PAYMENTS.CANCEL_SUCCESS');
            this.refresh();
          },
          error: () => this.errorHandler.showError('PAYMENTS.CANCEL_ERROR')
        });
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      COMPLETED: '#10b981',
      PENDING: '#f59e0b',
      PROCESSING: '#3b82f6',
      FAILED: '#ef4444',
      CANCELLED: '#6b7280',
      REFUNDED: '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      CASH: 'PAYMENTS.CASH',
      VISA: 'PAYMENTS.VISA',
      MASTERCARD: 'PAYMENTS.MASTERCARD',
      INSTAPAY: 'PAYMENTS.INSTAPAY',
      FAWRY: 'PAYMENTS.FAWRY',
      WALLET: 'PAYMENTS.WALLET',
      BANK_TRANSFER: 'PAYMENTS.BANK_TRANSFER'
    };
    return this.translate.instant(labels[method] || method);
  }

  getPaymentMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      CASH: 'payments',
      VISA: 'credit_card',
      MASTERCARD: 'credit_card',
      INSTAPAY: 'account_balance',
      FAWRY: 'store',
      WALLET: 'account_balance_wallet',
      BANK_TRANSFER: 'transfer_within_a_station'
    };
    return icons[method] || 'payment';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      COMPLETED: 'PAYMENTS.COMPLETED',
      PENDING: 'PAYMENTS.PENDING',
      PROCESSING: 'PAYMENTS.PROCESSING',
      FAILED: 'PAYMENTS.FAILED',
      CANCELLED: 'PAYMENTS.CANCELLED',
      REFUNDED: 'PAYMENTS.REFUNDED'
    };
    return this.translate.instant(labels[status] || status);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ar-EG');
  }

  formatAmount(amount: number): string {
    return this.currencyService.format(amount, 'ar');
  }

  canRefund(payment: Payment): boolean {
    return payment.status === 'COMPLETED';
  }

  canCancel(payment: Payment): boolean {
    return payment.status === 'PENDING' || payment.status === 'PROCESSING';
  }

  viewReceipt(referenceNumber: string): void {
    this.router.navigate(['/payments/receipt', referenceNumber]);
  }

  resetFilters(): void {
    this.filterForm.reset({ status: '', paymentMethod: '' });
    this.searchQuery.set('');
    this.pageIndex.set(0);
    this.refresh();
  }
}
