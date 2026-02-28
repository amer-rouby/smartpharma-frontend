import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings/settings.component')
      .then(m => m.SettingsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile-settings.component')
      .then(m => m.ProfileSettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pharmacy',
    loadComponent: () => import('./pharmacy/pharmacy-settings.component')
      .then(m => m.PharmacySettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('../users/users.routes')
      .then(m => m.USERS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./notifications/notification-settings.component')
      .then(m => m.NotificationSettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'security',
    loadComponent: () => import('./security/security-settings.component')
      .then(m => m.SecuritySettingsComponent),
    canActivate: [authGuard]
  },
  // {
  //   path: 'language',
  //   loadComponent: () => import('./language/language-settings.component')
  //     .then(m => m.LanguageSettingsComponent),
  //   canActivate: [authGuard]
  // },
  {
    path: 'backup',
    loadComponent: () => import('./backup/backup-settings.component')
      .then(m => m.BackupSettingsComponent),
    canActivate: [authGuard]
  }
];
