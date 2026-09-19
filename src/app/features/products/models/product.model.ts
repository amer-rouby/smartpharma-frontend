import { Validators } from '@angular/forms';
import { CrudModel, HasForm } from '../../../core/crud';
import { ProductCrudService } from '../services/product-crud.service';

export class ProductModel extends CrudModel<ProductModel, ProductCrudService> implements HasForm {
  override $$primaryKey = 'id' as const;
  override $$service = 'ProductCrudService';

  id = 0;
  pharmacyId = 0;
  name = '';
  scientificName = '';
  barcode = '';
  category = '';
  unitType = 'BOX';
  minStockLevel = 10;
  prescriptionRequired = false;
  totalStock = 0;
  sellPrice = 0;
  buyPrice = 0;
  extraAttributes: Record<string, unknown> = {};
  createdAt = '';
  updatedAt?: string;

  // Create-only, never returned by the API on the entity itself.
  initialStock?: number;
  expiryDate?: string | Date;

  buildForm() {
    return {
      name: ['', Validators.required],
      scientificName: [''],
      barcode: [''],
      category: [''],
      unitType: ['BOX'],
      minStockLevel: [10, [Validators.min(0)]],
      prescriptionRequired: [false],
      sellPrice: [0, [Validators.required, Validators.min(0.01)]],
      buyPrice: [0, [Validators.min(0)]],
      manufacturer: [''],
      activeIngredients: [''],
      description: [''],
      usageInstructions: [''],
      storageConditions: [''],
      drugInteractionWarning: [''],
      isControlledSubstance: [false],
      initialStock: [null],
      expiryDate: [null],
    };
  }
}
