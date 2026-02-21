import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    PageHeaderComponent,
    RouterLink
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  settingsItems = [
    { icon: 'person', label: 'الملف الشخصي', route: '/settings/profile' },
    { icon: 'people', label: 'إدارة المستخدمين', route: '/settings/users' },
    { icon: 'store', label: 'إعدادات الصيدلية', route: '/settings/pharmacy' },
    { icon: 'notifications', label: 'الإشعارات', route: '/settings/notifications' },
    { icon: 'security', label: 'الأمان', route: '/settings/security' }
  ];

  constructor() { }
}
