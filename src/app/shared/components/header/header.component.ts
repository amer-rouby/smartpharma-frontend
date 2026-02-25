import { Component, EventEmitter, Output, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService, NotificationModel } from '../../../core/services/notification.service';
import { User } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MaterialModule,
    TranslateModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() readonly toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly notifications = signal<NotificationModel[]>([]);
  readonly searchQuery = signal<string>('');
  readonly currentLang = signal<string>('ar');
  readonly unreadCount = signal(0);
  readonly totalCount = signal(0);

  private refreshSubscription?: Subscription;
  private notificationsSubscription?: Subscription;

  readonly notificationCount = computed(() => this.unreadCount());

  readonly userDisplayName = computed(() =>
    this.currentUser()?.fullName ?? 'مستخدم'
  );

  readonly userDisplayRole = computed(() =>
    this.currentUser()?.role ?? 'دور'
  );

  readonly quickActions = [
    { route: '/products/new', icon: 'inventory_2', label: 'NAV.PRODUCTS_ADD', color: 'primary' },
    { route: '/sales/pos', icon: 'point_of_sale', label: 'NAV.SALES_POS', color: 'accent' },
    { route: '/stock/adjustment', icon: 'adjust', label: 'NAV.STOCK_ALERTS', color: 'warn' }
  ];

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.currentUser.set(user));
    this.loadNotifications();
    this.startAutoRefresh();

    const saved = localStorage.getItem('language');
    if (saved === 'ar' || saved === 'en') {
      this.currentLang.set(saved);
    }
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.notificationsSubscription?.unsubscribe();
  }

  private loadNotifications(): void {
    this.notificationsSubscription?.unsubscribe();
    this.notificationsSubscription = this.notificationService.getNotifications(0, 10).subscribe({
      next: (response) => {
        const notificationsList = response.content || [];
        this.notifications.set(notificationsList);
        this.totalCount.set(response.totalElements || 0);

        const unreadCount = notificationsList.filter(n => !n.read).length;
        this.unreadCount.set(unreadCount);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.unreadCount.set(0);
      }
    });
  }

  private startAutoRefresh(): void {
    this.refreshSubscription?.unsubscribe();

    this.notificationService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount.set(count)
    });

    const intervalId = setInterval(() => {
      this.notificationService.getUnreadCount().subscribe({
        next: (count) => {
          this.unreadCount.set(count);
          this.loadNotifications();
        }
      });
    }, 30000);

    this.refreshSubscription = {
      unsubscribe: () => clearInterval(intervalId)
    } as Subscription;
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      console.log('Searching for:', query);
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.clearSearch();
      event.preventDefault();
    }
  }

  // ✅ FIXED: Mark as read WITHOUT navigation
  markAsRead(notificationId: number): void {
    this.notifications.update(list =>
      list.map(n => {
        if (n.id === notificationId && !n.read) {
          return { ...n, read: true };
        }
        return n;
      })
    );

    this.unreadCount.update(count => Math.max(0, count - 1));

    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.notificationService.getUnreadCount().subscribe({
          next: (count) => this.unreadCount.set(count)
        });
      }
    });
  }

  // ✅ Mark all as read
  markAllAsRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
    this.unreadCount.set(0);

    this.notificationService.markAllAsRead().subscribe();
  }

  // ✅ FIXED: Click notification - mark as read ONLY (no navigation)
  onNotificationClick(notification: NotificationModel): void {
    if (!notification.read) {
      this.markAsRead(notification.id);
    }
    // ✅ NO navigation - just mark as read and keep menu open
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  changeLanguage(lang: 'ar' | 'en'): void {
    this.currentLang.set(lang);
    this.translate.use(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  getTypeIcon(type: string): string {
    return this.notificationService.getTypeIcon(type);
  }

  getPriorityColor(priority: string): string {
    return this.notificationService.getPriorityColor(priority);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
