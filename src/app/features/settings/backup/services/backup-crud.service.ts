import { Injectable, Type } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CastResponseContainer } from 'cast-response';
import { CrudWithDialogService, PagedResult, RegisterServiceMixin } from '../../../../core/crud';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models';
import { Backup } from '../../../../core/models/settings/Backup.model';
import { BackupModel } from '../models/backup.model';
import { BackupDialogComponent } from '../backup-dialog/backup-dialog.component';

@CastResponseContainer({
  $default: {
    model: () => BackupModel,
  },
})
@Injectable({ providedIn: 'root' })
export class BackupCrudService extends RegisterServiceMixin(CrudWithDialogService)<BackupModel, BackupDialogComponent, number> {
  $$serviceName = 'BackupCrudService';

  override getSegmentUrl(): string {
    return `${environment.apiUrl}/settings/backup`;
  }

  // Backend has no pagination for backups (a flat list, usually a handful of
  // rows) - wrapped as a single page so the list screen can still use
  // CrudPageDirective without inventing a fake paginator UI for it.
  override getAll(): Observable<PagedResult<BackupModel>> {
    return this.http.get<ApiResponse<Backup[]>>(this.getSegmentUrl()).pipe(
      map((res) => {
        const content = (res.data ?? []).map((b) => Object.assign(new BackupModel(), b));
        const result = new PagedResult<BackupModel>();
        result.content = content;
        result.totalElements = content.length;
        result.totalPages = 1;
        result.size = content.length || 1;
        result.number = 0;
        result.first = true;
        result.last = true;
        return result;
      }),
    );
  }

  override getDialogComponent(): Type<BackupDialogComponent> {
    return BackupDialogComponent;
  }

  override getModelInstance(): BackupModel {
    return new BackupModel();
  }

  // CreateBackupRequest has no id/filePath/fileSize/status/createdAt.
  override toRequestPayload(model: BackupModel): unknown {
    const { backupName, backupType, description } = model;
    return { backupName, backupType, description };
  }

  downloadBackup(id: number): Observable<Blob> {
    return this.http.get(`${this.getSegmentUrl()}/${id}/download`, { responseType: 'blob' });
  }
}
