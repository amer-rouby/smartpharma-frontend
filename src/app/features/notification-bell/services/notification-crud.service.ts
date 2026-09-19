import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CrudService, PagedResult } from '../../../core/crud';
import { environment } from '../../../../environments/environment';
import { NotificationModel } from '../../../core/models/Notification.model';
import { NotificationService } from '../../../core/services/notification.service';

// Thin CRUD-page adapter over the existing NotificationService, which stays
// as the shared service for locale-aware mapping (title/message/time/icon),
// the SSE stream, the header bell's unread count, and mark/delete actions -
// all used well beyond this one list screen (header, stock-management,
// notification-panel). Only the paginated "all" list is wrapped here so the
// list screen can use CrudPageDirective; everything else stays on
// NotificationService directly, same split as e.g. SupplierCrudService
// coexisting with the legacy PurchaseOrderService for non-CRUD actions.
@Injectable({ providedIn: 'root' })
export class NotificationCrudService extends CrudService<NotificationModel, number> {
  private readonly notificationService = inject(NotificationService);

  override getSegmentUrl(): string {
    return `${environment.apiUrl}/notifications`;
  }

  override getAll(options?: Record<string, unknown>): Observable<PagedResult<NotificationModel>> {
    const page = Number(options?.['page'] ?? 0);
    const size = Number(options?.['size'] ?? 10);

    return this.notificationService.getNotifications(page, size).pipe(
      map((res) => {
        const result = new PagedResult<NotificationModel>();
        result.content = res.content ?? [];
        result.totalElements = res.totalElements ?? 0;
        result.totalPages = res.totalPages ?? 0;
        result.size = res.pageSize ?? size;
        result.number = res.pageNumber ?? page;
        return result;
      }),
    );
  }
}
