import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../shared/material.module';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationModel } from '../../core/models/Notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MaterialModule, PageHeaderComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  readonly notifications = signal<NotificationModel[]>([]);
  readonly loading = signal(false);
  readonly selectedTab = signal(0);

  // الباجينيشن
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = signal(0);

  // تحديث تلقائي للعدد غير المقروء في الـ Badge فقط
  readonly unreadBadgeCount = computed(() => {
    // هذا فقط للعرض في التبويب العلوي
    return this.notifications().filter(n => !n.read).length;
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  // ✅ دالة التحميل المركزية
  loadNotifications(): void {
    this.loading.set(true);

    // إرسال رقم الصفحة والحجم للسيرفر
    this.notificationService.getNotifications(this.pageIndex(), this.pageSize())
      .subscribe({
        next: (res) => {
          this.notifications.set(res.content || []);
          this.totalElements.set(res.totalElements || 0);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notifications.set([]);
        }
      });
  }

  // ✅ عند تغيير التبويب، نعود للصفحة رقم 0 ونعيد التحميل
  onTabChange(index: number): void {
    this.selectedTab.set(index);
    this.pageIndex.set(0);
    this.loadNotifications();
  }

  // ✅ عند تغيير الصفحة أو الحجم
  onPageChange(event: any): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadNotifications();
  }

  markAsRead(id: number): void {
    // تحديث فوري في الواجهة (Optimistic)
    this.notifications.update(list => list.map(n => n.id === id ? { ...n, read: true } : n));
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
    this.notificationService.markAllAsRead().subscribe({
      next: () => this.loadNotifications() // إعادة تحميل لضمان دقة البيانات من السيرفر
    });
  }

  deleteNotification(id: number): void {
    if (confirm('هل أنت متأكد من حذف هذا التنبيه؟')) {
      this.notificationService.deleteNotification(id).subscribe({
        next: () => {
          // إذا حذفنا آخر عنصر في الصفحة، نعود صفحة للخلف
          if (this.notifications().length === 1 && this.pageIndex() > 0) {
            this.pageIndex.update(v => v - 1);
          }
          this.loadNotifications();
        }
      });
    }
  }

  // الدوال المساعدة
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
