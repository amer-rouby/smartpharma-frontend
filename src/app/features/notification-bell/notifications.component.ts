import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../shared/material.module';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationModel } from '../../core/models/Notification.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CrudPageDirective } from '../../core/crud';
import { NotificationCrudService } from './services/notification-crud.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MaterialModule, PageHeaderComponent],
  templateUrl: './notifications.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent extends CrudPageDirective<NotificationModel, NotificationCrudService> {
  readonly service = inject(NotificationCrudService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  readonly unreadNotifications = signal<NotificationModel[]>([]);
  readonly selectedTab = signal(0);

  // Tab 1 ("unread") is its own unpaginated dataset, different rows than tab 0.
  readonly filteredNotifications = computed(() => {
    return this.selectedTab() === 0 ? this.models() : this.unreadNotifications();
  });

  readonly hasPagination = computed(() => {
    return this.selectedTab() === 0 && this.totalElements() > this.pageSize();
  });

  readonly unreadBadgeCount = computed(() => this.unreadNotifications().length);

  constructor() {
    super();
    this.loadUnreadNotifications();
  }

  loadUnreadNotifications(): void {
    this.notificationService.getUnreadNotifications().subscribe({
      next: (list) => this.unreadNotifications.set(list),
      error: (err) => this.errorHandler.handleHttpError(err, 'NOTIFICATIONS.LOAD_ERROR')
    });
  }

  onTabChange(index: number): void {
    this.selectedTab.set(index);
  }

  markAsRead(id: number): void {
    this.unreadNotifications.update(list => list.filter(n => n.id !== id));
    this.notificationService.markAsRead(id).subscribe({
      next: () => this.refresh(),
      error: (err) => this.errorHandler.handleHttpError(err, 'NOTIFICATIONS.MARK_READ_ERROR')
    });
  }

  markAllAsRead(): void {
    this.unreadNotifications.set([]);
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.errorHandler.showSuccess('NOTIFICATIONS.MARK_ALL_SUCCESS');
        this.refresh();
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'NOTIFICATIONS.MARK_ALL_ERROR')
    });
  }

  deleteNotification(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('NOTIFICATIONS.DELETE_CONFIRM_TITLE'),
        message: this.translate.instant('NOTIFICATIONS.DELETE_CONFIRM_MESSAGE'),
        confirmText: this.translate.instant('COMMON.YES'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.notificationService.deleteNotification(id).subscribe({
          next: () => {
            this.errorHandler.showSuccess('NOTIFICATIONS.DELETE_SUCCESS');
            this.unreadNotifications.update(list => list.filter(n => n.id !== id));
            if (this.models().length === 1 && this.pageIndex() > 0) {
              this.pageIndex.update(v => v - 1);
            } else {
              this.refresh();
            }
          },
          error: (err) => this.errorHandler.handleHttpError(err, 'NOTIFICATIONS.DELETE_ERROR')
        });
      }
    });
  }

  getPriorityClass(priority: string) {
    const p = priority?.toUpperCase();
    if (p === 'URGENT') return 'urgent';
    if (p === 'HIGH') return 'high';
    if (p === 'MEDIUM') return 'medium';
    return 'low';
  }

  getTypeIcon(type: string) { return this.notificationService.getTypeIcon(type); }
  getPriorityColor(priority: string) { return this.notificationService.getPriorityColor(priority); }
  getTypeLabel(type: string) { return this.notificationService.getTypeLabel(type); }
  formatDate(date: string) {
    return new Date(date).toLocaleString('ar-EG', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
