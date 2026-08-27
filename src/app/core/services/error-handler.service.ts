import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorConfig {
  duration?: number;
  panelClass?: string[];
  params?: any;
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  private readonly defaultConfig: ErrorConfig = {
    duration: 3000,
    panelClass: ['error-snackbar']
  };

  handleHttpError(error: HttpErrorResponse, fallbackKey: string = 'COMMON.ERROR'): void {
    if (this.showByCode(error.error?.code, error.error?.params)) {
      return;
    }

    let messageKey = fallbackKey;

    switch (error.status) {
      case 0:
        messageKey = 'ERRORS.CONNECTION';
        break;
      case 401:
        messageKey = 'ERRORS.UNAUTHORIZED';
        break;
      case 403:
        messageKey = 'ERRORS.FORBIDDEN';
        break;
      case 404:
        messageKey = 'ERRORS.NOT_FOUND';
        break;
      case 500:
        messageKey = 'ERRORS.SERVER';
        break;
      default:
        messageKey = fallbackKey;
    }

    this.show(messageKey, this.defaultConfig);
  }

  // A backend error carrying a stable `code` (+ interpolation `params`) resolves
  // to ERRORS.<code> in ar.json/en.json - shared by handleHttpError and by any
  // caller that only has a plain {code, params} pair (e.g. an error wrapped by
  // a service before it reaches the component). Returns false (shows nothing)
  // when there's no code or no matching translation, so the caller can fall
  // back to its own generic message.
  showByCode(code: string | undefined, params?: Record<string, any>): boolean {
    if (!code) return false;
    const key = `ERRORS.${code}`;
    const translated = this.translate.instant(key, params);
    if (translated === key) return false;
    this.show(key, { ...this.defaultConfig, params });
    return true;
  }

  show(messageKey: string, config?: ErrorConfig): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    const message = this.translate.instant(messageKey, finalConfig.params);

    this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), {
      duration: finalConfig.duration,
      panelClass: finalConfig.panelClass
    });
  }

  showSuccess(messageKey: string, config?: ErrorConfig): void {
    this.show(messageKey, {
      ...this.defaultConfig,
      ...config,
      panelClass: ['success-snackbar']
    });
  }

  showError(messageKey: string, config?: ErrorConfig): void {
    this.show(messageKey, {
      ...this.defaultConfig,
      ...config,
      panelClass: ['error-snackbar']
    });
  }

  showWarning(messageKey: string, config?: ErrorConfig): void {
    this.show(messageKey, {
      ...this.defaultConfig,
      ...config,
      panelClass: ['warning-snackbar']
    });
  }
}
