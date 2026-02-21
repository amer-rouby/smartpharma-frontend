import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterData } from '../../../core/models';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MaterialModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData: RegisterData = {
    pharmacyName: '',
    licenseNumber: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    fullName: ''
  };
  loading = false;
  hidePassword = true;
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.showError('كلمات المرور غير متطابقة');
      return;
    }

    this.loading = true;

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'تم التسجيل بنجاح',
          text: 'تم إنشاء حسابك بنجاح، سيتم تحويلك للوحة التحكم',
          timer: 2000,
          showConfirmButton: false
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.showError(error.error?.message || 'حدث خطأ أثناء التسجيل');
      }
    });
  }

  validateForm(): boolean {
    const requiredFields = [
      { field: this.registerData.pharmacyName, name: 'اسم الصيدلية' },
      { field: this.registerData.licenseNumber, name: 'رقم الترخيص' },
      { field: this.registerData.email, name: 'البريد الإلكتروني' },
      { field: this.registerData.phone, name: 'رقم الهاتف' },
      { field: this.registerData.username, name: 'اسم المستخدم' },
      { field: this.registerData.password, name: 'كلمة المرور' },
      { field: this.registerData.fullName, name: 'الاسم الكامل' }
    ];

    for (const item of requiredFields) {
      if (!item.field) {
        this.showError(`يرجى إدخال ${item.name}`);
        return false;
      }
    }

    if (this.registerData.password.length < 6) {
      this.showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    return true;
  }

  showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'خطأ',
      text: message,
      confirmButtonText: 'حسناً'
    });
  }
}
