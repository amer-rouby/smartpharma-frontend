import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { ProfileService } from '../../../core/services/settings/profile.service';
import { PasswordChangeRequest, Profile, ProfileUpdateRequest } from '../../../core/models/settings/profile.model';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, ReactiveFormsModule],
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss'
})
export class ProfileSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly profileService = inject(ProfileService);

  readonly loading = signal(false);
  readonly profile = signal<Profile | null>(null);
  readonly showPasswordForm = signal(false);

  readonly profileForm: FormGroup;
  readonly passwordForm: FormGroup;

  readonly genders = [
    { value: 'MALE', label: 'PROFILE.MALE' },
    { value: 'FEMALE', label: 'PROFILE.FEMALE' },
    { value: 'OTHER', label: 'PROFILE.OTHER' }
  ];

  constructor() {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(50)]],
      profileImageUrl: ['', [Validators.maxLength(255)]],
      jobTitle: ['', [Validators.maxLength(100)]],
      department: ['', [Validators.maxLength(50)]],
      address: ['', [Validators.maxLength(100)]],
      city: ['', [Validators.maxLength(50)]],
      country: ['', [Validators.maxLength(50)]],
      bio: ['', [Validators.maxLength(500)]],
      gender: ['']
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);

    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.profileForm.patchValue({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          profileImageUrl: data.profileImageUrl,
          jobTitle: data.jobTitle,
          department: data.department,
          address: data.address,
          city: data.city,
          country: data.country,
          bio: data.bio,
          gender: data.gender
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.snackBar.open(
          this.translate.instant('PROFILE.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.snackBar.open(
        this.translate.instant('VALIDATION.REQUIRED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    this.loading.set(true);
    const request: ProfileUpdateRequest = this.profileForm.value;

    this.profileService.updateProfile(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('PROFILE.UPDATE_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('PROFILE.UPDATE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        console.error('Save error:', error);
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.snackBar.open(
        this.translate.instant('VALIDATION.REQUIRED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    this.loading.set(true);
    const request: PasswordChangeRequest = this.passwordForm.value;

    this.profileService.changePassword(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.passwordForm.reset();
        this.showPasswordForm.set(false);
        this.snackBar.open(
          this.translate.instant('PROFILE.PASSWORD_CHANGED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('PROFILE.PASSWORD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        console.error('Password change error:', error);
      }
    });
  }

  togglePasswordForm(): void {
    this.showPasswordForm.update(value => !value);
    if (!this.showPasswordForm()) {
      this.passwordForm.reset();
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }

    return null;
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ADMIN': this.translate.instant('USERS.ADMIN'),
      'PHARMACIST': this.translate.instant('USERS.PHARMACIST'),
      'MANAGER': this.translate.instant('USERS.MANAGER'),
      'VIEWER': this.translate.instant('USERS.VIEWER')
    };
    return labels[role] || role;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
