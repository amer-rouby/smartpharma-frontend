import { Injectable } from '@angular/core';
import { CrudService } from '../../../../core/crud';
import { environment } from '../../../../../environments/environment';
import { Payment } from '../../../../core/models/payment.model';

// Read-only list (refund/cancel go through PaymentService's own dedicated
// endpoints, not create/update/delete here) - the existing Payment interface
// works directly as the model, no CrudModel subclass needed.
@Injectable({ providedIn: 'root' })
export class PaymentCrudService extends CrudService<Payment, number> {
  override getSegmentUrl(): string {
    return `${environment.apiUrl}/payments`;
  }

  override getGetAllEndpoint(): string {
    return this.getSegmentUrl();
  }
}
