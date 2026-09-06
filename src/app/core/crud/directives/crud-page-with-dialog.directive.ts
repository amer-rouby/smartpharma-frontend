import { Directive, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { CrudModelContract } from '../classes/crud-model';
import { CrudWithDialogServiceContract } from '../services/crud-with-dialog.service';
import { CrudPageDirective } from './crud-page.directive';

@Directive()
export abstract class CrudPageWithDialogDirective<
  TModel extends CrudModelContract<TModel>,
  TService extends CrudWithDialogServiceContract<TModel, unknown>,
> extends CrudPageDirective<TModel, TService> {
  private readonly dialog = inject(MatDialog);
  protected readonly translate = inject(TranslateService);

  openCreateDialog(model?: TModel): MatDialogRef<unknown> {
    const ref = this.service.openCreateDialog(model);
    ref.afterClosed().subscribe((result) => result && this.refresh());
    return ref;
  }

  openUpdateDialog(model: TModel): MatDialogRef<unknown> {
    const ref = this.service.openUpdateDialog(model);
    ref.afterClosed().subscribe((result) => result && this.refresh());
    return ref;
  }

  openViewDialog(model: TModel): MatDialogRef<unknown> {
    return this.service.openViewDialog(model);
  }

  protected getDeleteConfirmMessage(model: TModel): string {
    return this.translate.instant('COMMON.DELETE_CONFIRM_GENERIC');
  }

  protected getDeleteSuccessKey(model: TModel): string {
    return 'COMMON.DELETE_SUCCESS';
  }

  protected getDeleteErrorKey(model: TModel): string {
    return 'COMMON.DELETE_ERROR';
  }

  protected getDeleteMessageParams(model: TModel): Record<string, unknown> {
    return {};
  }

  confirmDelete(model: TModel) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: this.translate.instant('COMMON.CONFIRM'),
          message: this.getDeleteConfirmMessage(model),
          confirmText: this.translate.instant('COMMON.YES'),
          cancelText: this.translate.instant('COMMON.CANCEL'),
          color: 'warn',
        },
      })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => {
        const params = this.getDeleteMessageParams(model);
        model.delete().subscribe({
          next: () => {
            this.errorHandler.showSuccess(this.getDeleteSuccessKey(model), { params });
            this.refresh();
          },
          error: (err) => this.errorHandler.handleHttpError(err, this.getDeleteErrorKey(model)),
        });
      });
  }
}
