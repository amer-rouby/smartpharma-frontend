import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterData } from '../../../core/models';
import { MaterialModule } from '../../../shared/material.module';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, MaterialModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  readonly translate = inject(TranslateService);
  readonly languageService = inject(LanguageService);
  readonly errorHandler = inject(ErrorHandlerService);

  readonly registerData = signal<RegisterData>({
    pharmacyName: '',
    licenseNumber: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    fullName: '',
    pharmacyId: 1  // ✅ أضف الحقل ده (أو اجعله nullable حسب الـ backend)
  });

  readonly loading = signal(false);
  readonly hidePassword = signal(true);
  readonly confirmPassword = signal('');
  readonly isSubmitted = signal(false);

  readonly formFields: Array<{
    key: keyof RegisterData;
    label: string;
    icon: string;
    type?: string;
  }> = [
      { key: 'pharmacyName', label: 'REGISTER.PHARMACY_NAME', icon: 'business' },
      { key: 'licenseNumber', label: 'REGISTER.LICENSE_NUMBER', icon: 'badge' },
      { key: 'email', label: 'AUTH.EMAIL', icon: 'email', type: 'email' },
      { key: 'phone', label: 'AUTH.PHONE', icon: 'phone', type: 'tel' },
      { key: 'fullName', label: 'AUTH.FULL_NAME', icon: 'person' },
      { key: 'username', label: 'AUTH.USERNAME', icon: 'account_circle' },
      { key: 'password', label: 'AUTH.PASSWORD', icon: 'lock', type: 'password' }
    ];

  onSubmit(): void {
    this.isSubmitted.set(true);

    if (!this.validateForm()) return;

    if (this.registerData().password !== this.confirmPassword()) {
      this.errorHandler.showWarning('VALIDATION.PASSWORD_MISMATCH');
      return;
    }

    this.loading.set(true);

    const registerPayload = {
      ...this.registerData(),
      pharmacyId: this.registerData().pharmacyId ?? 1
    };

    this.authService.register(registerPayload).subscribe({
      next: () => {
        this.loading.set(false);
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('REGISTER.SUCCESS_TITLE'),
          text: this.translate.instant('REGISTER.SUCCESS_MESSAGE'),
          timer: 2000,
          showConfirmButton: false
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading.set(false);
        const errorMessage = error.error?.message ||
          error.error?.errors?.[0]?.defaultMessage ||
          'REGISTER.ERROR';
        this.errorHandler.handleHttpError(error, errorMessage);
      }
    });
  }

  validateForm(): boolean {
    const data = this.registerData();

    for (const field of this.formFields) {
      const value = this.getFieldValue(field.key);
      if (!value) {
        const label = this.translate.instant(field.label);
        this.errorHandler.showWarning('VALIDATION.REQUIRED', { params: { field: label } });
        return false;
      }
    }

    if (data.password.length < 6) {
      this.errorHandler.showWarning('VALIDATION.PASSWORD_MIN');
      return false;
    }

    return true;
  }

  getFieldValue(key: keyof RegisterData): string {
    return this.registerData()[key] as string;
  }

  setFieldValue(key: keyof RegisterData, value: string): void {
    this.registerData.update(data => ({ ...data, [key]: value }));
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  changeLanguage(lang: 'ar' | 'en'): void {
    this.languageService.setLanguage(lang);
  }

  getCurrentLang(): string {
    return this.languageService.getCurrentLanguage();
  }
}
