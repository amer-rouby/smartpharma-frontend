import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Single source for pharmacy-scoped API calls.
 * Replaces duplicated getPharmacyId() in every service.
 */
@Injectable({ providedIn: 'root' })
export class PharmacyContextService {
  private readonly auth = inject(AuthService);

  getPharmacyId(fallback = 1): number {
    return this.auth.getPharmacyId() ?? fallback;
  }

  /** HttpParams with pharmacyId set (merges into existing params). */
  pharmacyParams(extra?: HttpParams | Record<string, string | number | boolean>): HttpParams {
    let params = new HttpParams().set('pharmacyId', this.getPharmacyId().toString());

    if (extra instanceof HttpParams) {
      extra.keys().forEach((key) => {
        const values = extra.getAll(key);
        if (values) {
          values.forEach((v) => {
            if (v !== null && key !== 'pharmacyId') {
              params = params.append(key, v);
            }
          });
        }
      });
      return params;
    }

    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        params = params.set(key, String(value));
      });
    }

    return params;
  }

  /** Build full API URL: environment.apiUrl + path segment. */
  apiUrl(path: string): string {
    const base = environment.apiUrl.replace(/\/$/, '');
    const segment = path.replace(/^\//, '');
    return `${base}/${segment}`;
  }

  /** Origin for static assets / uploads (without /api suffix). */
  apiOrigin(): string {
    return environment.apiUrl.replace(/\/api\/?$/, '');
  }

  resolveAssetUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/api/') || url.startsWith('/')) {
      return `${this.apiOrigin()}${url}`;
    }
    return url;
  }
}
