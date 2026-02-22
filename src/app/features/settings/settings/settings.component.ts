import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';

interface SettingsItem {
  icon: string;
  labelKey: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);

  readonly settingsItems = signal<SettingsItem[]>([
    { icon: 'person', labelKey: 'SETTINGS.PROFILE', route: '/settings/profile' },
    { icon: 'people', labelKey: 'SETTINGS.USERS', route: '/settings/users', roles: ['ADMIN'] },
    { icon: 'store', labelKey: 'SETTINGS.PHARMACY', route: '/settings/pharmacy' },
    { icon: 'notifications', labelKey: 'SETTINGS.NOTIFICATIONS', route: '/settings/notifications' },
    { icon: 'security', labelKey: 'SETTINGS.SECURITY', route: '/settings/security' },
    { icon: 'language', labelKey: 'SETTINGS.LANGUAGE', route: '/settings/language' },
    { icon: 'backup', labelKey: 'SETTINGS.BACKUP', route: '/settings/backup' }
  ]);

  readonly filteredItems = signal<SettingsItem[]>([]);

  ngOnInit(): void {
    this.filterItemsByRole();
  }

  // ✅ استخدام localStorage بدلاً من authService.getUserRole()
  filterItemsByRole(): void {
    const userRole = localStorage.getItem('userRole');
    const items = this.settingsItems().filter(item =>
      !item.roles || (userRole && item.roles.includes(userRole))
    );
    this.filteredItems.set(items);
  }

  getLabel(key: string): string {
    return this.translate.instant(key);
  }

  getCurrentLang(): string {
    return this.languageService.getCurrentLanguage();
  }
}
