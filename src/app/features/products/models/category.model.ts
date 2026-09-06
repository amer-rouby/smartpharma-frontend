import { Validators } from '@angular/forms';
import { CrudModel, HasForm } from '../../../core/crud';
import { CategoryCrudService } from '../services/category-crud.service';

export class CategoryModel extends CrudModel<CategoryModel, CategoryCrudService> implements HasForm {
  override $$primaryKey = 'id' as const;
  override $$service = 'CategoryCrudService';

  id = 0;
  name = '';
  nameAr = '';
  nameEn = '';
  description = '';
  icon = 'category';
  color = '#667eea';
  isActive = true;
  pharmacyId = 0;
  createdAt = '';
  updatedAt = '';

  buildForm() {
    return {
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      icon: ['category'],
      color: ['#667eea'],
      isActive: [true],
    };
  }
}
