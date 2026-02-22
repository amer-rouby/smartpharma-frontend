import {
  Component,
  EventEmitter,
  Output,
  inject,
  signal,
  computed,
  OnInit,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../material.module';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationModel, NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MaterialModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Output() readonly toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  // ✅ Signals
  readonly currentUser = signal<User | null>(null);
  readonly notifications = signal<any[]>([]);
  readonly searchQuery = signal<string>('');

  // ✅ Computed Signals (استخدم دول في الـ HTML)
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

  // ✅ Quick Actions
  readonly quickActions = [
    { route: '/products/new', icon: 'inventory_2', label: 'منتج جديد', color: 'primary' },
    { route: '/sales/pos', icon: 'point_of_sale', label: 'عملية بيع', color: 'accent' },
    { route: '/stock/adjustment', icon: 'adjust', label: 'تعديل مخزون', color: 'warn' }
  ];

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => this.currentUser.set(user));

    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.notificationService.getUnreadNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: NotificationModel[]) => {
          this.notifications.set(data.map(n => ({
            ...n,
            read: false // ✅ مهم عشان متحصلش خطأ
          })));
        },
        error: (error) => console.error('Error loading notifications:', error)
      });
  }

  logout(): void {
    this.authService.logout();
  }

  markAsRead(notificationId: number): void {
    this.notifications.update(notifications =>
      notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
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
}
