import { Validators } from '@angular/forms';
import { CrudModel, HasForm } from '../../../../core/crud';
import { StockBatchCrudService } from '../services/stock-batch-crud.service';

export class StockBatchModel extends CrudModel<StockBatchModel, StockBatchCrudService> implements HasForm {
  override $$primaryKey = 'id' as const;
  override $$service = 'StockBatchCrudService';

  id = 0;
  productId = 0;
  productName?: string;
  batchNumber = '';
  quantityCurrent = 0;
  quantityInitial = 0;
  expiryDate = '';
  productionDate?: string;
  location = '';
  shelf = '';
  warehouse = '';
  notes = '';
  status: 'ACTIVE' | 'EXPIRED' | 'DISCARDED' | 'GOOD' | 'LOW' | 'EXPIRING_SOON' = 'ACTIVE';
  createdAt?: string;
  updatedAt?: string;
  pharmacyId?: number;
  buyPrice?: number;
  sellPrice?: number;
  version?: number;

  buildForm() {
    return {
      productId: ['', Validators.required],
      batchNumber: ['', [Validators.required, Validators.minLength(3)]],
      quantityCurrent: [0, [Validators.required, Validators.min(0)]],
      quantityInitial: [0, [Validators.min(0)]],
      expiryDate: [null, Validators.required],
      productionDate: [null],
      location: [''],
      shelf: [''],
      warehouse: [''],
      notes: [''],
      status: ['ACTIVE']
    };
  }
}
