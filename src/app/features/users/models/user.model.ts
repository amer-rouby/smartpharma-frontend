import { Validators } from '@angular/forms';
import { CrudModel, HasForm } from '../../../core/crud';
import { UserRole } from '../../../core/models/user.model';
import { UserCrudService } from '../services/user-crud.service';

export class UserModel extends CrudModel<UserModel, UserCrudService> implements HasForm {
  override $$primaryKey = 'id' as const;
  override $$service = 'UserCrudService';

  id = 0;
  username = '';
  password = '';
  fullName = '';
  email = '';
  phone = '';
  role: UserRole = UserRole.PHARMACIST;
  isActive = true;
  pharmacyId = 0;
  pharmacyName = '';
  lastLoginAt = '';
  createdAt = '';
  updatedAt = '';

  buildForm() {
    return {
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: [''],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      phone: [''],
      role: [UserRole.PHARMACIST, Validators.required],
      isActive: [true],
    };
  }
}
