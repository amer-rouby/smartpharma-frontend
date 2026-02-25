import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../shared/material.module';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { NotificationService, NotificationModel } from '../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MaterialModule,
    PageHeaderComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly notifications = signal<NotificationModel[]>([]);
  readonly filteredNotifications = signal<NotificationModel[]>([]);
  readonly loading = signal(false);
  readonly selectedTab = signal(0); // 0 = all, 1 = unread
  readonly totalCount = signal(0);
  readonly unreadCount = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);
  readonly totalElements = signal(0);

  ngOnInit(): void {
    console.log('🔔 NotificationsComponent initialized');
    this.loadNotifications();
  }

  // ✅ FIXED: Load notifications properly
  loadNotifications(): void {
    console.log('📥 Loading notifications...');
    this.loading.set(true);

    this.notificationService.getNotifications(this.pageIndex(), this.pageSize()).subscribe({
      next: (response) => {
        console.log('✅ Notifications response:', response);

        const notificationsList = response.content || [];
        this.notifications.set(notificationsList);
        this.totalElements.set(response.totalElements || 0);
        this.totalCount.set(response.totalElements || 0);

        const unread = notificationsList.filter(n => !n.read);
        this.unreadCount.set(unread.length);

        console.log(`📊 Total: ${notificationsList.length}, Unread: ${unread.length}`);

        // ✅ Apply filter based on selected tab
        this.applyFilter();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading notifications:', error);
        this.notifications.set([]);
        this.filteredNotifications.set([]);
        this.loading.set(false);
      }
    });
  }

  // ✅ FIXED: Apply filter correctly
  applyFilter(): void {
    const allNotifications = this.notifications();
    console.log('🔍 Applying filter. Tab:', this.selectedTab(), 'Total notifications:', allNotifications.length);

    if (this.selectedTab() === 1) {
      // Show only unread
      const unreadNotifications = allNotifications.filter(n => {
        const isUnread = !n.read;
        console.log(`  Notification ${n.id}: read=${n.read}, include=${isUnread}`);
        return isUnread;
      });
      this.filteredNotifications.set(unreadNotifications);
      console.log(`✅ Showing ${unreadNotifications.length} unread notifications`);
    } else {
      // Show all
      this.filteredNotifications.set(allNotifications);
      console.log(`✅ Showing all ${allNotifications.length} notifications`);
    }
  }

  // ✅ FIXED: Handle tab change
  onTabChange(index: number): void {
    console.log('📑 Tab changed to:', index === 0 ? 'All' : 'Unread');
    this.selectedTab.set(index);
    this.pageIndex.set(0);
    this.applyFilter();
  }

  onPageChange(event: any): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadNotifications();
  }

  markAsRead(notificationId: number): void {
    console.log('🔔 Marking notification as read:', notificationId);

    this.notifications.update(list =>
      list.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );

    this.unreadCount.update(count => Math.max(0, count - 1));
    this.applyFilter();

    this.notificationService.markAsRead(notificationId).subscribe();
  }

  markAllAsRead(): void {
    console.log('🔔 Marking all as read');

    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
    this.unreadCount.set(0);
    this.applyFilter();

    this.notificationService.markAllAsRead().subscribe();
  }

  deleteNotification(notificationId: number): void {
    if (confirm('هل أنت متأكد من حذف هذا التنبيه؟')) {
      this.notificationService.deleteNotification(notificationId).subscribe({
        next: () => {
          this.notifications.update(list => list.filter(n => n.id !== notificationId));
          this.totalCount.update(count => Math.max(0, count - 1));
          this.applyFilter();
        }
      });
    }
  }

  getTypeIcon(type: string): string {
    return this.notificationService.getTypeIcon(type);
  }

  getPriorityColor(priority: string): string {
    return this.notificationService.getPriorityColor(priority);
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'URGENT': 'عاجل',
      'HIGH': 'عالي',
      'MEDIUM': 'متوسط',
      'LOW': 'منخفض'
    };
    return labels[priority] || priority;
  }

  getTypeLabel(type: string): string {
    return this.notificationService.getTypeLabel(type);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
