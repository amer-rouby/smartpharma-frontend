import { Validators } from '@angular/forms';
import { CrudModel, HasForm } from '../../../../core/crud';
import { BackupCrudService } from '../services/backup-crud.service';

export class BackupModel extends CrudModel<BackupModel, BackupCrudService> implements HasForm {
  override $$primaryKey = 'id' as const;
  override $$service = 'BackupCrudService';

  id = 0;
  backupName = '';
  filePath = '';
  fileSize = 0;
  backupType = 'FULL';
  status = '';
  description = '';
  createdAt = '';
  restoredAt?: string;

  buildForm() {
    return {
      backupName: ['', [Validators.required, Validators.minLength(3)]],
      backupType: ['FULL', Validators.required],
      description: ['']
    };
  }
}
