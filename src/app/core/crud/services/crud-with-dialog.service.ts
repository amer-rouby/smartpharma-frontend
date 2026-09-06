import { Type, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrudService } from './crud.service';
import { CrudServiceContract } from '../interfaces/crud-service-contract.interface';

export type CrudDialogMode = 'CREATE' | 'UPDATE' | 'VIEW';

export interface CrudDialogData<Model> {
  mode: CrudDialogMode;
  model?: Model;
}

export interface CrudWithDialogServiceContract<Model, Component, PrimaryKeyType = number> extends CrudServiceContract<Model, PrimaryKeyType> {
  getDialogComponent(): Type<Component>;
  getModelInstance(): Model;
  openCreateDialog(model?: Model): MatDialogRef<Component>;
  openUpdateDialog(model: Model): MatDialogRef<Component>;
  openViewDialog(model: Model): MatDialogRef<Component>;
}

export abstract class CrudWithDialogService<Model, Component, PrimaryKeyType = number>
  extends CrudService<Model, PrimaryKeyType>
  implements CrudWithDialogServiceContract<Model, Component, PrimaryKeyType>
{
  protected readonly dialog = inject(MatDialog);

  abstract getDialogComponent(): Type<Component>;
  abstract getModelInstance(): Model;

  protected getDialogWidth(): string {
    return '450px';
  }

  openCreateDialog(model?: Model): MatDialogRef<Component> {
    return this.dialog.open<Component, CrudDialogData<Model>>(this.getDialogComponent(), {
      width: this.getDialogWidth(),
      data: { mode: 'CREATE', model: model ?? this.getModelInstance() },
    });
  }

  openUpdateDialog(model: Model): MatDialogRef<Component> {
    return this.dialog.open<Component, CrudDialogData<Model>>(this.getDialogComponent(), {
      width: this.getDialogWidth(),
      data: { mode: 'UPDATE', model },
    });
  }

  openViewDialog(model: Model): MatDialogRef<Component> {
    return this.dialog.open<Component, CrudDialogData<Model>>(this.getDialogComponent(), {
      width: this.getDialogWidth(),
      data: { mode: 'VIEW', model },
    });
  }
}
