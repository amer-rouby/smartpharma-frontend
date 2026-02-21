import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/LoginRequest.model';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MaterialModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };
  loading = false;
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.show_error('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    this.loading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'تم تسجيل الدخول بنجاح',
          text: `مرحباً ${response.fullName}`,
          timer: 2000,
          showConfirmButton: false
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.show_error(error.error?.message || 'حدث خطأ أثناء تسجيل الدخول');
      }
    });
  }

  show_error(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'خطأ',
      text: message,
      confirmButtonText: 'حسناً'
    });
  }
}
