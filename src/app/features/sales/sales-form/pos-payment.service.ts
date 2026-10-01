import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { PaymentRequest, PaymentResponse } from '../../../core/models/payment.model';

// Card/wallet payments for the POS: charging before the sale is recorded,
// and cancelling the charge when the server then refuses the sale.
@Injectable({ providedIn: 'root' })
export class PosPaymentService {
  private readonly paymentService = inject(PaymentService);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly translate = inject(TranslateService);

  /** Charges the amount; a PENDING payment is shown to the cashier first. */
  async charge(paymentMethod: string, amount: number, customerPhone: string): Promise<PaymentResponse> {
    const request: PaymentRequest = {
      pharmacyId: this.authService.getPharmacyId() || 1,
      amount,
      paymentMethod,
      customerName: '',
      customerPhone,
      customerEmail: '',
      description: `Sale - ${new Date().toLocaleDateString('ar-EG')}`
    };
    const response = await firstValueFrom(this.paymentService.processPayment(request));
    if (response.status === 'PENDING') {
      await Swal.fire({
        icon: 'info',
        title: this.translate.instant('PAYMENTS.PENDING_TITLE'),
        text: response.message || this.translate.instant('PAYMENTS.PENDING_MESSAGE'),
        confirmButtonText: this.translate.instant('COMMON.OK'),
        confirmButtonColor: '#f59e0b'
      });
    }
    return response;
  }

  /** Cancels a charge whose sale was refused; tells the cashier either way. */
  async cancel(reference: string): Promise<void> {
    try {
      await firstValueFrom(this.paymentService.cancelPayment(reference));
      this.errorHandler.showWarning('PAYMENT.CANCELLED_SALE_REFUSED');
    } catch {
      this.errorHandler.showError('PAYMENT.CANCEL_FAILED_REFUND_MANUALLY', { params: { reference } });
    }
  }
}
