import { Component, EventEmitter, Output, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationModel, NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models';

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
export class HeaderComponent implements OnInit {
  @Output() readonly toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = signal<User | null>(null);
  readonly notifications = signal<any[]>([]);
  readonly searchQuery = signal<string>('');
  readonly currentLang = signal<string>('ar');

  readonly notificationCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  readonly unreadNotifications = computed(() =>
    this.notifications().filter(n => !n.read)
  );

  readonly userDisplayName = computed(() =>
    this.currentUser()?.fullName ?? 'مستخدم'
  );

  readonly userDisplayRole = computed(() =>
    this.currentUser()?.role ?? 'دور'
  );

  readonly userDisplayEmail = computed(() =>
    this.currentUser()?.email ?? 'user@smartpharma.com'
  );

  readonly quickActions = [
    { route: '/products/new', icon: 'inventory_2', label: 'NAV.PRODUCTS_ADD', color: 'primary' },
    { route: '/sales/pos', icon: 'point_of_sale', label: 'NAV.SALES_POS', color: 'accent' },
    { route: '/stock/adjustment', icon: 'adjust', label: 'NAV.STOCK_ALERTS', color: 'warn' }
  ];

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => this.currentUser.set(user));

    this.loadNotifications();

    // ✅ Load saved language
    const saved = localStorage.getItem('language');
    if (saved === 'ar' || saved === 'en') {
      this.currentLang.set(saved);
    }
  }

  private loadNotifications(): void {
    this.notificationService.getUnreadNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: NotificationModel[]) => {
          this.notifications.set(data.map(n => ({ ...n, read: false })));
        },
        error: (error) => console.error('Error loading notifications:', error)
      });
  }

  logout(): void {
    this.authService.logout();
  }

  markAsRead(notificationId: number): void {
    this.notifications.update(notifications =>
      notifications.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    this.notificationService.markAsRead(notificationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  markAllAsRead(): void {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
    this.notificationService.markAllAsRead()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
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

  // ✅ Change Language Method
  changeLanguage(lang: 'ar' | 'en'): void {
    this.currentLang.set(lang);
    this.translate.use(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
}
