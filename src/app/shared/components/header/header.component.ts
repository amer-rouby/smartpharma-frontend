import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { timer, switchMap, catchError, of } from 'rxjs';

import { MaterialModule } from '../../material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

import { output } from '@angular/core';
import { NotificationModel } from '../../../core/models/Notification.model';
import { NotificationPanelComponent } from '../../../features/notification-bell/notification-panel/notification-panel.component';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MaterialModule,
    TranslateModule,
    NotificationPanelComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);
   readonly notificationService = inject(NotificationService);
  private audioService = inject(AudioService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly toggleSidebar = output<void>();
  readonly searchQuery = signal<string>('');
  readonly currentLang = signal<string>(localStorage.getItem('language') || 'ar');
  readonly notifications = signal<NotificationModel[]>([]);
  readonly totalCount = signal(0);
  readonly unreadCount = signal(0);
  readonly currentUser = toSignal(this.authService.currentUser$);

  readonly userDisplayName = computed(() => this.currentUser()?.fullName ?? 'مستخدم');
  readonly userDisplayRole = computed(() => this.currentUser()?.role ?? 'دور');

  readonly quickActions = [
    { route: '/products/new', icon: 'inventory_2', label: 'NAV.PRODUCTS_ADD', color: 'primary' },
    { route: '/sales/pos', icon: 'point_of_sale', label: 'NAV.SALES_POS', color: 'accent' },
    { route: '/stock/alerts', icon: 'adjust', label: 'NAV.STOCK_ALERTS', color: 'warn' }
  ];

  ngOnInit(): void {
    this.initLanguage();
    this.loadNotifications();
    this.setupNotificationPolling();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications(0, 100).subscribe({
      next: (response) => {
        const list = response.content || [];
        this.notifications.set([...list]);
        this.totalCount.set(response.totalElements || 0);
        this.unreadCount.set(list.filter(n => !n.read).length);
      },
      error: () => {
        this.notifications.set([]);
        this.unreadCount.set(0);
      }
    });
  }

  private initLanguage(): void {
    const lang = this.currentLang() as 'ar' | 'en';
    this.changeLanguage(lang);
  }

  private lastUnreadCount = 0;

  private setupNotificationPolling(): void {
    timer(0, 30000).pipe(
      switchMap(() => this.notificationService.getNotifications(0, 1000)),
      catchError(() => of({ content: [], totalElements: 0 }))
    ).subscribe(response => {
      const list = response.content || [];
      const currentUnread = list.filter(n => !n.read).length;

      if (currentUnread > this.lastUnreadCount && this.lastUnreadCount !== 0) {
        this.audioService.playNotificationSound();
      }

      this.lastUnreadCount = currentUnread;
      this.notifications.set(list);
      this.unreadCount.set(currentUnread);
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

  onMarkAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  onNotificationClick(notification: NotificationModel): void {
    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  onViewAllNotifications(): void {
    this.router.navigate(['/notifications']);
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

}
