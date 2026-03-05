import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/LoginRequest.model';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, MaterialModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  readonly snackBar = inject(MatSnackBar);
  readonly translate = inject(TranslateService);
  readonly languageService = inject(LanguageService);
  readonly errorHandler = inject(ErrorHandlerService);

  credentials: LoginRequest = { username: '', password: '' };
  loading = false;
  hidePassword = true;
  isSubmitted = false;

  onSubmit(): void {
    this.isSubmitted = true;

    if (!this.credentials.username || !this.credentials.password) {
      this.errorHandler.showWarning('AUTH.LOGIN_FAILED');
      return;
    }

    this.loading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('AUTH.LOGIN_SUCCESS'),
          text: `${this.translate.instant('COMMON.WELCOME')} ${response.fullName}`,
          timer: 2000,
          showConfirmButton: false
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.errorHandler.handleHttpError(error, 'AUTH.INVALID_CREDENTIALS');
      }
    });
  }

  changeLanguage(lang: 'ar' | 'en'): void {
    this.languageService.setLanguage(lang);
  }

  getCurrentLang(): string {
    return this.languageService.getCurrentLanguage();
  }
}
