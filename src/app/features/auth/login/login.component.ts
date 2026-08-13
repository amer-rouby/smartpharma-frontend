import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/LoginRequest.model';
import { MaterialModule } from '../../../shared/material.module';
import { AuthBackgroundComponent } from '../../../shared/components/auth-background/auth-background.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, MaterialModule, AuthBackgroundComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly snackBar = inject(MatSnackBar);
  readonly translate = inject(TranslateService);
  readonly languageService = inject(LanguageService);
  readonly errorHandler = inject(ErrorHandlerService);

  credentials: LoginRequest = { username: '', password: '' };
  loading = false;
  hidePassword = true;
  isSubmitted = false;

  sessionExpiredMessage: string | null = null;

  // Second step of login, only entered when the account has 2FA enabled - see
  // AuthService.login()/completeTwoFactorLogin().
  twoFactorRequired = false;
  twoFactorTempToken: string | null = null;
  twoFactorCode = '';
  twoFactorSubmitted = false;

  ngOnInit(): void {
    // Check for session expiration query params
    this.route.queryParams.subscribe(params => {
      if (params['expired']) {
        this.authService.forceLogout();
        this.sessionExpiredMessage = 'AUTH.SESSION_EXPIRED';
        this.showSessionExpiredWarning('AUTH.SESSION_EXPIRED');
        this.clearSessionExpiredParams();
      } else if (params['sessionExpired']) {
        this.authService.forceLogout();
        this.sessionExpiredMessage = 'AUTH.SESSION_EXPIRED';
        this.showSessionExpiredWarning('AUTH.SESSION_EXPIRED');
        this.clearSessionExpiredParams();
      }
    });
  }

  private showSessionExpiredWarning(messageKey: string): void {
    this.snackBar.open(
      `${this.translate.instant(messageKey)} - ${this.translate.instant('AUTH.PLEASE_LOGIN_AGAIN')}`,
      undefined,
      {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['warning-snackbar']
      }
    );
  }

  private clearSessionExpiredParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        expired: null,
        sessionExpired: null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onSubmit(): void {
    Swal.close();
    this.isSubmitted = true;

    if (!this.credentials.username || !this.credentials.password) {
      this.errorHandler.showWarning('AUTH.LOGIN_FAILED');
      return;
    }

    this.loading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.twoFactorRequired) {
          this.twoFactorRequired = true;
          this.twoFactorTempToken = response.twoFactorTempToken ?? null;
          return;
        }

        this.showLoginSuccessAndNavigate(response.fullName);
      },
      error: (error) => {
        this.loading = false;
        this.errorHandler.handleHttpError(error, 'AUTH.INVALID_CREDENTIALS');
      }
    });
  }

  onSubmitTwoFactorCode(): void {
    this.twoFactorSubmitted = true;

    if (!this.twoFactorCode || !this.twoFactorTempToken) {
      return;
    }

    this.loading = true;

    this.authService.completeTwoFactorLogin(this.twoFactorTempToken, this.twoFactorCode).subscribe({
      next: (response) => {
        this.loading = false;
        this.showLoginSuccessAndNavigate(response.fullName);
      },
      error: (error) => {
        this.loading = false;
        this.errorHandler.handleHttpError(error, 'AUTH.INVALID_TWO_FACTOR_CODE');
      }
    });
  }

  backToLogin(): void {
    this.twoFactorRequired = false;
    this.twoFactorTempToken = null;
    this.twoFactorCode = '';
    this.twoFactorSubmitted = false;
  }

  private showLoginSuccessAndNavigate(fullName: string): void {
    Swal.fire({
      icon: 'success',
      title: this.translate.instant('AUTH.LOGIN_SUCCESS'),
      text: `${this.translate.instant('COMMON.WELCOME')} ${fullName}`,
      timer: 2000,
      showConfirmButton: false
    });
    this.router.navigate(['/dashboard']);
  }

  changeLanguage(lang: 'ar' | 'en'): void {
    this.languageService.setLanguage(lang);
  }

  getCurrentLang(): string {
    return this.languageService.getCurrentLanguage();
  }
}
