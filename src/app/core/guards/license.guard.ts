import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { LicenseService } from '../services/license.service';

// Fails open on a network/server error so a transient glitch never locks out
// a paying customer.
export const licenseGuard: CanActivateFn = (route, state) => {
  // Always allow the license screens themselves, or an expired pharmacy could never fix it.
  if (state.url.startsWith('/license')) {
    return true;
  }

  const licenseService = inject(LicenseService);
  const router = inject(Router);

  return licenseService.ensureStatusLoaded().pipe(
    map((status) => {
      if (status.expired) {
        router.navigate(['/license/renew']);
        return false;
      }
      return true;
    }),
    catchError(() => of(true))
  );
};
