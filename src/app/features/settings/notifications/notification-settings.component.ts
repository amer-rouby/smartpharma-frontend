import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { NotificationSettingsService } from '../../../core/services/settings/notification-settings.service';

type ChannelType = 'email' | 'sms' | 'push';

interface NotificationCategory {
  id: string;
  title: string;
  icon: string;
  settings: NotificationSetting[];
}

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.scss'
})
export class NotificationSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly notificationSettingsService = inject(NotificationSettingsService);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly notificationForm: FormGroup = this.fb.group({
    emailNotifications: [true],
    smsNotifications: [false],
    pushNotifications: [true],
    soundEnabled: [true],
    vibrationEnabled: [true],
    quietHours: this.fb.group({
      enabled: [false],
      startTime: ['22:00'],
      endTime: ['08:00']
    })
  });

  categories: NotificationCategory[] = [];

  readonly channelTypes: ChannelType[] = ['email', 'sms', 'push'];

  ngOnInit(): void {
    this.loadNotificationSettings();
  }

  loadNotificationSettings(): void {
    this.loading.set(true);

    this.notificationSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.notificationForm.patchValue({
          emailNotifications: settings.emailNotifications,
          smsNotifications: settings.smsNotifications,
          pushNotifications: settings.pushNotifications,
          soundEnabled: settings.soundEnabled,
          vibrationEnabled: settings.vibrationEnabled,
          quietHours: {
            enabled: settings.quietHoursEnabled,
            startTime: settings.quietHoursStart || '22:00',
            endTime: settings.quietHoursEnd || '08:00'
          }
        });

        this.categories = [
          {
            id: 'inventory',
            title: 'NOTIFICATIONS.CATEGORIES.INVENTORY',
            icon: 'inventory_2',
            settings: [
              {
                key: 'notifyLowStock',
                label: 'NOTIFICATIONS.SETTINGS.LOW_STOCK',
                description: 'NOTIFICATIONS.DESC.LOW_STOCK',
                enabled: settings.notifyLowStock,
                channels: { email: settings.emailNotifications, sms: false, push: true }
              },
              {
                key: 'notifyOutOfStock',
                label: 'NOTIFICATIONS.SETTINGS.OUT_OF_STOCK',
                description: 'NOTIFICATIONS.DESC.OUT_OF_STOCK',
                enabled: settings.notifyOutOfStock,
                channels: { email: settings.emailNotifications, sms: settings.smsNotifications, push: true }
              },
              {
                key: 'notifyExpiryWarning',
                label: 'NOTIFICATIONS.SETTINGS.EXPIRY_WARNING',
                description: 'NOTIFICATIONS.DESC.EXPIRY_WARNING',
                enabled: settings.notifyExpiryWarning,
                channels: { email: settings.emailNotifications, sms: false, push: true }
              },
              {
                key: 'notifyExpiredProducts',
                label: 'NOTIFICATIONS.SETTINGS.EXPIRED_PRODUCTS',
                description: 'NOTIFICATIONS.DESC.EXPIRED_PRODUCTS',
                enabled: settings.notifyExpiredProducts,
                channels: { email: settings.emailNotifications, sms: settings.smsNotifications, push: true }
              }
            ]
          },
          {
            id: 'sales',
            title: 'NOTIFICATIONS.CATEGORIES.SALES',
            icon: 'shopping_cart',
            settings: [
              {
                key: 'notifyNewSale',
                label: 'NOTIFICATIONS.SETTINGS.NEW_SALE',
                description: 'NOTIFICATIONS.DESC.NEW_SALE',
                enabled: settings.notifyNewSale,
                channels: { email: false, sms: false, push: false }
              },
              {
                key: 'notifyLargeSale',
                label: 'NOTIFICATIONS.SETTINGS.LARGE_SALE',
                description: 'NOTIFICATIONS.DESC.LARGE_SALE',
                enabled: settings.notifyLargeSale,
                channels: { email: settings.emailNotifications, sms: false, push: true }
              },
              {
                key: 'notifyRefund',
                label: 'NOTIFICATIONS.SETTINGS.REFUND',
                description: 'NOTIFICATIONS.DESC.REFUND',
                enabled: settings.notifyRefund,
                channels: { email: settings.emailNotifications, sms: false, push: true }
              }
            ]
          },
          {
            id: 'expenses',
            title: 'NOTIFICATIONS.CATEGORIES.EXPENSES',
            icon: 'payments',
            settings: [
              {
                key: 'notifyNewExpense',
                label: 'NOTIFICATIONS.SETTINGS.NEW_EXPENSE',
                description: 'NOTIFICATIONS.DESC.NEW_EXPENSE',
                enabled: settings.notifyNewExpense,
                channels: { email: settings.emailNotifications, sms: false, push: true }
              },
              {
                key: 'notifyLargeExpense',
                label: 'NOTIFICATIONS.SETTINGS.LARGE_EXPENSE',
                description: 'NOTIFICATIONS.DESC.LARGE_EXPENSE',
                enabled: settings.notifyLargeExpense,
                channels: { email: settings.emailNotifications, sms: settings.smsNotifications, push: true }
              }
            ]
          },
          {
            id: 'system',
            title: 'NOTIFICATIONS.CATEGORIES.SYSTEM',
            icon: 'settings',
            settings: [
              {
                key: 'notifySystemUpdates',
                label: 'NOTIFICATIONS.SETTINGS.SYSTEM_UPDATES',
                description: 'NOTIFICATIONS.DESC.SYSTEM_UPDATES',
                enabled: settings.notifySystemUpdates,
                channels: { email: settings.emailNotifications, sms: false, push: true }
              },
              {
                key: 'notifyBackupReminder',
                label: 'NOTIFICATIONS.SETTINGS.BACKUP_REMINDER',
                description: 'NOTIFICATIONS.DESC.BACKUP_REMINDER',
                enabled: settings.notifyBackupReminder,
                channels: { email: settings.emailNotifications, sms: false, push: false }
              },
              {
                key: 'notifySecurityAlerts',
                label: 'NOTIFICATIONS.SETTINGS.SECURITY_ALERTS',
                description: 'NOTIFICATIONS.DESC.SECURITY_ALERTS',
                enabled: settings.notifySecurityAlerts,
                channels: { email: settings.emailNotifications, sms: settings.smsNotifications, push: true }
              }
            ]
          }
        ];

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading notification settings:', error);
        this.snackBar.open(
          this.translate.instant('NOTIFICATIONS.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        this.loading.set(false);
      }
    });
  }

  toggleAllChannels(category: NotificationCategory, channel: ChannelType): void {
    const allEnabled = category.settings.every(setting => setting.channels[channel]);
    category.settings.forEach(setting => {
      setting.channels[channel] = !allEnabled;
    });
  }

  toggleAllSettings(category: NotificationCategory): void {
    const allEnabled = category.settings.every(setting => setting.enabled);
    category.settings.forEach(setting => {
      setting.enabled = !allEnabled;
    });
  }

  isAllChannelsEnabled(category: NotificationCategory, channel: ChannelType): boolean {
    return category.settings.every(setting => setting.channels[channel]);
  }

  areAllSettingsEnabled(category: NotificationCategory): boolean {
    return category.settings.every(setting => setting.enabled);
  }

  getToggleAllIcon(category: NotificationCategory): string {
    return this.areAllSettingsEnabled(category) ? 'check_box' : 'check_box_outline_blank';
  }

  onSave(): void {
    if (this.notificationForm.invalid) {
      this.snackBar.open(
        this.translate.instant('VALIDATION.REQUIRED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    this.saving.set(true);

    const formValue = this.notificationForm.value;

    const request = {
      emailNotifications: formValue.emailNotifications,
      smsNotifications: formValue.smsNotifications,
      pushNotifications: formValue.pushNotifications,
      soundEnabled: formValue.soundEnabled,
      vibrationEnabled: formValue.vibrationEnabled,
      quietHoursEnabled: formValue.quietHours?.enabled,
      quietHoursStart: formValue.quietHours?.startTime,
      quietHoursEnd: formValue.quietHours?.endTime,
      ...this.categories.reduce((acc, category) => {
        category.settings.forEach(setting => {
          acc[setting.key] = setting.enabled;
        });
        return acc;
      }, {} as Record<string, boolean>)
    };

    this.notificationSettingsService.updateSettings(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open(
          this.translate.instant('SETTINGS.SAVE_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error) => {
        console.error('Error saving notification settings:', error);
        this.saving.set(false);
        this.snackBar.open(
          this.translate.instant('SETTINGS.SAVE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      }
    });
  }

  onReset(): void {
    this.loadNotificationSettings();
    this.snackBar.open(
      this.translate.instant('COMMON.RESET'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 2000 }
    );
  }

  getChannelIcon(channel: ChannelType): string {
    const icons: Record<ChannelType, string> = {
      email: 'email',
      sms: 'sms',
      push: 'notifications'
    };
    return icons[channel];
  }

  getChannelLabel(channel: ChannelType): string {
    const labels: Record<ChannelType, string> = {
      email: 'NOTIFICATIONS.CHANNELS.EMAIL',
      sms: 'NOTIFICATIONS.CHANNELS.SMS',
      push: 'NOTIFICATIONS.CHANNELS.PUSH'
    };
    return labels[channel];
  }
}
