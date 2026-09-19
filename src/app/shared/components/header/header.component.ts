import { Component, inject, signal, computed, OnInit, OnDestroy, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../../material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationSettingsService } from '../../../core/services/settings/notification-settings.service';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AudioService } from '../../../core/services/audio.service';
import { ProfileService } from '../../../core/services/settings/profile.service';
import { PharmacyContextService } from '../../../core/services/pharmacy-context.service';
import { NotificationModel } from '../../../core/models/Notification.model';
import { NotificationPanelComponent } from '../../../features/notification-bell/notification-panel/notification-panel.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    MaterialModule,
    TranslateModule,
    NotificationPanelComponent
  ],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly notificationSettingsService = inject(NotificationSettingsService);
  private readonly audioService = inject(AudioService);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);
  private readonly profileService = inject(ProfileService);
  private readonly pharmacyContext = inject(PharmacyContextService);
  private readonly router = inject(Router);

  readonly toggleSidebar = output<void>();
  readonly currentLang = signal<string>(this.languageService.getCurrentLanguage());
  readonly isDarkTheme = signal<boolean>(this.themeService.isDark());
  readonly notifications = signal<NotificationModel[]>([]);
  readonly totalCount = signal(0);
  readonly unreadCount = signal(0);
  readonly currentUser = toSignal(this.authService.currentUser$);
  readonly profileImageUrl = signal<string | null>(null);

  private langSubscription?: Subscription;
  private themeSubscription?: Subscription;
  private notificationStreamSubscription?: Subscription;
  private lastUnreadCount = 0;
  private soundEnabled = true;
  private vibrationEnabled = true;

  readonly userDisplayName = computed(() => this.currentUser()?.fullName ?? 'مستخدم');
  readonly userDisplayRole = computed(() => this.currentUser()?.role ?? 'دور');
  readonly pharmacyDisplayName = computed(() => this.currentUser()?.pharmacyName?.trim() ?? '');

  hasAccess(roles?: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    const userRole = this.currentUser()?.role;
    if (!userRole) {
      return false;
    }
    return roles.includes(userRole);
  }

  ngOnInit(): void {
    this.initLanguage();
    this.loadNotifications();
    this.setupNotificationStream();
    this.loadNotificationAlertPrefs();
    this.loadProfileImage();

    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang.set(lang);
      // Already-fetched notifications were mapped to title/message in the previous
      // language - refetch so the bell picks up the new one immediately instead of
      // waiting for the next natural reload.
      this.loadNotifications();
    });

    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkTheme.set(theme === 'dark');
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  loadNotifications(playSoundOnIncrease = false): void {
    this.notificationService.getNotifications(0, 100).subscribe({
      next: (response) => {
        const list = response.content || [];
        const currentUnread = list.filter(n => !n.read).length;

        if (playSoundOnIncrease && currentUnread > this.lastUnreadCount && this.lastUnreadCount !== 0) {
          this.alertNewNotification();
        }

        this.lastUnreadCount = currentUnread;
        this.notifications.set([...list]);
        this.totalCount.set(response.totalElements || 0);
        this.unreadCount.set(currentUnread);
      },
      error: () => {
        this.notifications.set([]);
        this.unreadCount.set(0);
      }
    });
  }

  private loadProfileImage(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        const imageUrl = profile?.profileImageUrl;
        if (!imageUrl) {
          this.profileImageUrl.set(null);
          return;
        }
        const resolved = imageUrl.startsWith('/api/') || imageUrl.startsWith('/')
          ? this.pharmacyContext.resolveAssetUrl(imageUrl)
          : imageUrl;
        this.profileImageUrl.set(resolved);
      },
      error: () => {
        this.profileImageUrl.set(null);
      }
    });
  }

  private initLanguage(): void {
    const lang = this.languageService.getCurrentLanguage() as 'ar' | 'en';
    this.currentLang.set(lang);
  }

  /** Caches the user's sound/vibration preference so incoming-notification
   * handling doesn't need a round-trip on every event; a stale cache just means
   * a preference change takes effect on next page load, which is fine here. */
  private loadNotificationAlertPrefs(): void {
    this.notificationSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.soundEnabled = settings?.soundEnabled ?? true;
        this.vibrationEnabled = settings?.vibrationEnabled ?? true;
      },
      error: () => {
        // Keep the defaults if settings can't be loaded.
      }
    });
  }

  private alertNewNotification(): void {
    if (this.soundEnabled) {
      this.audioService.playNotificationSound();
    }
    if (this.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }

  private setupNotificationStream(): void {
    this.notificationStreamSubscription = this.notificationService.connectToNotificationStream()
      .subscribe(event => {
        if (event.type === 'connected') {
          return;
        }

        if (event.type === 'notification-created' && event.notification) {
          this.addIncomingNotification(event.notification);
          return;
        }

        this.loadNotifications(true);
      });
  }

  private addIncomingNotification(notification: NotificationModel): void {
    const currentList = this.notifications();
    if (currentList.some(item => item.id === notification.id)) {
      return;
    }

    const updatedList = [notification, ...currentList].slice(0, 100);
    const currentUnread = updatedList.filter(n => !n.read).length;

    if (currentUnread > this.lastUnreadCount && this.lastUnreadCount !== 0) {
      this.alertNewNotification();
    }

    this.lastUnreadCount = currentUnread;
    this.notifications.set(updatedList);
    this.totalCount.update(count => count + 1);
    this.unreadCount.set(currentUnread);
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
    this.languageService.setLanguage(lang);
    this.currentLang.set(lang);
  }

  toggleLanguage(): void {
    this.changeLanguage(this.currentLang() === 'ar' ? 'en' : 'ar');
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
    this.themeSubscription?.unsubscribe();
    this.notificationStreamSubscription?.unsubscribe();
  }
}
