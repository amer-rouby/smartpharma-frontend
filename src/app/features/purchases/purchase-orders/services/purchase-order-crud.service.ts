import { Injectable } from '@angular/core';
import { CrudService } from '../../../../core/crud';
import { environment } from '../../../../../environments/environment';
import { PurchaseOrder } from '../../../../core/models/purchase-order.model';

// Read-only list (no create/edit dialog here - orders are created/edited via
// dedicated routes) so this only needs the bare CrudService, not the dialog
// variant, and PurchaseOrder's own plain interface works fine as the model -
// there's no save()/clone() use, so no CrudModel subclass is needed.
@Injectable({ providedIn: 'root' })
export class PurchaseOrderCrudService extends CrudService<PurchaseOrder, number> {
  override getSegmentUrl(): string {
    return `${environment.apiUrl}/purchase-orders`;
  }

  override getGetAllEndpoint(): string {
    return this.getSegmentUrl();
  }
}
