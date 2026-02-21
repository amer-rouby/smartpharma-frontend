import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface NotificationModel {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  icon: string;
  time: string;
  isRead: boolean;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`

  // بيانات تجريبية للتطوير
  private mockNotifications: NotificationModel[] = [
    {
      id: 1,
      type: 'warning',
      message: 'منتج بنادول وصل لحد المخزون الأدنى',
      icon: 'warning',
      time: 'منذ 5 دقائق',
      isRead: false,
      link: '/stock/alerts'
    },
    {
      id: 2,
      type: 'info',
      message: 'تم إضافة 5 منتجات جديدة للمخزون',
      icon: 'inventory_2',
      time: 'منذ ساعة',
      isRead: false,
      link: '/products'
    },
    {
      id: 3,
      type: 'success',
      message: 'تم إتمام عملية بيع بنجاح',
      icon: 'check_circle',
      time: 'منذ ساعتين',
      isRead: true,
      link: '/sales/history'
    },
    {
      id: 4,
      type: 'error',
      message: 'منتج أوجمنت منتهي الصلاحية',
      icon: 'error',
      time: 'منذ 3 ساعات',
      isRead: false,
      link: '/stock/expired'
    }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * جلب الإشعارات غير المقروءة
   */
  getUnreadNotifications(): Observable<NotificationModel[]> {
    // للتطوير: استخدام البيانات التجريبية
    // للإنتاج: استخدم الـ API الحقيقي
    return of(this.mockNotifications.filter(n => !n.isRead));

    // للكود الحقيقي مع Backend:
    // const pharmacyId = this.authService.getPharmacyId();
    // return this.http.get<Notification[]>(`${this.apiUrl}/unread`, {
    //   params: new HttpParams().set('pharmacyId', pharmacyId!)
    // });
  }

  /**
   * جلب كل الإشعارات
   */
  getAllNotifications(): Observable<NotificationModel[]> {
    return of(this.mockNotifications);

    // للكود الحقيقي:
    // const pharmacyId = this.authService.getPharmacyId();
    // return this.http.get<Notification[]>(this.apiUrl, {
    //   params: new HttpParams().set('pharmacyId', pharmacyId!)
    // });
  }

  /**
   * تعيين إشعار كمقروء
   */
  markAsRead(notificationId: number): Observable<void> {
    // للتطوير
    const index = this.mockNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.mockNotifications[index].isRead = true;
    }
    return of(undefined);

    // للكود الحقيقي:
    // return this.http.put<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  /**
   * تعيين كل الإشعارات كمقروءة
   */
  markAllAsRead(): Observable<void> {
    this.mockNotifications.forEach(n => n.isRead = true);
    return of(undefined);

    // للكود الحقيقي:
    // return this.http.put<void>(`${this.apiUrl}/read-all`, {});
  }

  /**
   * حذف إشعار
   */
  deleteNotification(notificationId: number): Observable<void> {
    const index = this.mockNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.mockNotifications.splice(index, 1);
    }
    return of(undefined);

    // للكود الحقيقي:
    // return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }

  /**
   * إنشاء إشعار جديد
   */
  createNotification(notification: Partial<NotificationModel>): Observable<NotificationModel> {
    const newNotification: NotificationModel = {
      id: Date.now(),
      type: notification.type || 'info',
      message: notification.message || '',
      icon: notification.icon || 'notifications',
      time: 'الآن',
      isRead: false,
      link: notification.link
    };
    this.mockNotifications.unshift(newNotification);
    return of(newNotification);
  }

  /**
   * الحصول على عدد الإشعارات غير المقروءة
   */
  getUnreadCount(): Observable<number> {
    return of(this.mockNotifications.filter(n => !n.isRead).length);
  }
}
