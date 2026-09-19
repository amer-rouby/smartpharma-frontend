import { Routes } from '@angular/router';

export const LICENSE_ROUTES: Routes = [
  {
    path: 'renew',
    loadComponent: () =>
      import('./license-renew/license-renew.component')
        .then(m => m.LicenseRenewComponent)
  },
  {
    path: 'generate',
    loadComponent: () =>
      import('./license-generate/license-generate.component')
        .then(m => m.LicenseGenerateComponent)
  }
];
