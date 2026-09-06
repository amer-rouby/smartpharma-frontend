import { Validators } from '@angular/forms';
import { CrudModel, HasForm } from '../../../../core/crud';
import { SupplierStatus } from '../../../../core/models/purchase-order.model';
import { SupplierCrudService } from '../services/supplier-crud.service';

export class SupplierModel extends CrudModel<SupplierModel, SupplierCrudService> implements HasForm {
  override $$primaryKey = 'id' as const;
  override $$service = 'SupplierCrudService';

  id = 0;
  name = '';
  contactPerson = '';
  phone = '';
  email = '';
  address = '';
  city = '';
  status: SupplierStatus = 'ACTIVE';
  notes = '';
  pharmacyId = 0;
  createdAt = '';
  updatedAt = '';

  buildForm() {
    return {
      name: ['', [Validators.required, Validators.minLength(2)]],
      contactPerson: [''],
      phone: [''],
      email: ['', [Validators.email]],
      address: [''],
      city: [''],
      status: ['ACTIVE'],
      notes: [''],
    };
  }
}
