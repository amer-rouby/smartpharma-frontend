import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { timer, switchMap, tap, catchError, of } from 'rxjs';

import { MaterialModule } from '../../material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { output } from '@angular/core';
import { NotificationModel } from '../../../core/models/Notification.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink, MaterialModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  readonly toggleSidebar = output<void>();
  readonly searchQuery = signal<string>('');
  readonly currentLang = signal<string>(localStorage.getItem('language') || 'ar');
  readonly notifications = signal<NotificationModel[]>([]);
  readonly totalCount = signal(0);
  readonly unreadCount = signal(0);
  readonly currentUser = toSignal(this.authService.currentUser$);
  readonly notificationCount = computed(() => this.unreadCount());
  readonly userDisplayName = computed(() => this.currentUser()?.fullName ?? 'مستخدم');
  readonly userDisplayRole = computed(() => this.currentUser()?.role ?? 'دور');

  readonly quickActions = [
    { route: '/products/new', icon: 'inventory_2', label: 'NAV.PRODUCTS_ADD', color: 'primary' },
    { route: '/sales/pos', icon: 'point_of_sale', label: 'NAV.SALES_POS', color: 'accent' },
    { route: '/stock/adjustment', icon: 'adjust', label: 'NAV.STOCK_ALERTS', color: 'warn' }
  ];

  ngOnInit(): void {
    this.initLanguage();
    this.setupNotificationPolling();
  }

  private initLanguage(): void {
    const lang = this.currentLang() as 'ar' | 'en';
    this.changeLanguage(lang);
  }

  private setupNotificationPolling(): void {
    timer(0, 30000).pipe(
      switchMap(() => this.notificationService.getNotifications(0, 1000)),
      catchError(err => {
        return of({ content: [], totalElements: 0 });
      })
    ).subscribe(response => {
      const list = response.content || [];
      this.notifications.set(list);
      this.totalCount.set(response.totalElements || 0);
      this.unreadCount.set(list.filter(n => !n.read).length);
    });
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) console.log('Searching for:', query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.clearSearch();
  }

  markAsRead(notificationId: number): void {
    this.notifications.update(list =>
      list.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    this.unreadCount.update(c => Math.max(0, c - 1));

    this.notificationService.markAsRead(notificationId).subscribe();
  }

  markAllAsRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
    this.unreadCount.set(0);
    this.notificationService.markAllAsRead().subscribe();
  }

  onNotificationClick(notification: NotificationModel): void {
    if (!notification.read) this.markAsRead(notification.id);
  }

  changeLanguage(lang: 'ar' | 'en'): void {
    this.currentLang.set(lang);
    this.translate.use(lang);
    localStorage.setItem('language', lang);

    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(this.currentLang() === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  getTypeIcon = (type: string) => this.notificationService.getTypeIcon(type);
  getPriorityColor = (priority: string) => this.notificationService.getPriorityColor(priority);
}
