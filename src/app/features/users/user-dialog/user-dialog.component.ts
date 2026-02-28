import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../../shared/material.module';
import { UserService } from '../../../core/services/user.service';
import { User, UserRequest, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  template: `
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <h2 mat-dialog-title>
          {{ data?.mode === 'edit' ? ('USERS.EDIT' | translate) : ('USERS.ADD_NEW' | translate) }}
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" mat-dialog-content>
        <!-- Username -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{'USERS.USERNAME' | translate}} *</mat-label>
          <input matInput formControlName="username" [placeholder]="'USERS.USERNAME' | translate">
          @if (form.get('username')?.invalid && form.get('username')?.touched) {
            <mat-error>{{'USERS.USERNAME_REQUIRED' | translate}}</mat-error>
          }
        </mat-form-field>

        <!-- Password -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{'USERS.PASSWORD' | translate}} {{ data?.mode === 'edit' ? '' : '*' }}</mat-label>
          <input matInput type="password" formControlName="password"
                 [placeholder]="data?.mode === 'edit' ? ('USERS.PASSWORD_HINT' | translate) : ('USERS.PASSWORD' | translate)">
          @if (form.get('password')?.invalid && form.get('password')?.touched) {
            <mat-error>{{'USERS.PASSWORD_REQUIRED' | translate}}</mat-error>
          }
        </mat-form-field>

        <!-- Full Name -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{'USERS.FULL_NAME' | translate}} *</mat-label>
          <input matInput formControlName="fullName" [placeholder]="'USERS.FULL_NAME' | translate">
          @if (form.get('fullName')?.invalid && form.get('fullName')?.touched) {
            <mat-error>{{'USERS.FULL_NAME_REQUIRED' | translate}}</mat-error>
          }
        </mat-form-field>

        <!-- Email -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{'USERS.EMAIL' | translate}}</mat-label>
          <input matInput type="email" formControlName="email" [placeholder]="'USERS.EMAIL' | translate">
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>{{'VALIDATION.EMAIL_INVALID' | translate}}</mat-error>
          }
        </mat-form-field>

        <!-- Phone -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{'USERS.PHONE' | translate}}</mat-label>
          <input matInput formControlName="phone" [placeholder]="'USERS.PHONE' | translate">
        </mat-form-field>

        <!-- Role -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{'USERS.ROLE' | translate}} *</mat-label>
          <mat-select formControlName="role">
            @for (role of userRoles; track role.value) {
              <mat-option [value]="role.value">{{role.label | translate}}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Active Toggle -->
        <div class="toggle-field">
          <mat-slide-toggle formControlName="isActive" color="primary">
            {{'USERS.IS_ACTIVE' | translate}}
          </mat-slide-toggle>
        </div>
      </form>

      <!-- Actions -->
      <div mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>
          {{'COMMON.CANCEL' | translate}}
        </button>
        <button mat-raised-button color="primary" [disabled]="form.invalid || loading()" (click)="onSubmit()">
          @if (loading()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>{{ data?.mode === 'edit' ? 'save' : 'add' }}</mat-icon>
          }
          {{ data?.mode === 'edit' ? ('COMMON.SAVE' | translate) : ('COMMON.ADD' | translate) }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container { min-width: 400px; max-width: 550px; }
    .dialog-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 24px; border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    .dialog-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
    mat-dialog-content { padding: 24px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .toggle-field { display: flex; align-items: center; padding: 8px 0; }
    mat-dialog-actions { padding: 12px 24px; border-top: 1px solid rgba(0,0,0,0.1); gap: 8px; }
  `]
})
export class UserDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UserDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly userService = inject(UserService);
  readonly data = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);

  readonly userRoles = [
    { value: UserRole.ADMIN, label: 'USERS.ADMIN' },
    { value: UserRole.PHARMACIST, label: 'USERS.PHARMACIST' },
    { value: UserRole.MANAGER, label: 'USERS.MANAGER' },
    { value: UserRole.VIEWER, label: 'USERS.VIEWER' }
  ];

  readonly form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', this.data?.mode === 'edit' ? [] : [Validators.required, Validators.minLength(6)]],
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.email]],
    phone: [''],
    role: [UserRole.PHARMACIST, Validators.required],
    isActive: [true]
  });

  constructor() {
    if (this.data?.user) {
      this.form.patchValue({
        username: this.data.user.username,
        fullName: this.data.user.fullName,
        email: this.data.user.email,
        phone: this.data.user.phone,
        role: this.data.user.role,
        isActive: this.data.user.isActive
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    const formValue = this.form.value;

    const request: UserRequest = {
      username: formValue.username,
      fullName: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      role: formValue.role,
      pharmacyId: this.data?.pharmacyId || 1,
      isActive: formValue.isActive
    };

    if (formValue.password && formValue.password.trim()) {
      request.password = formValue.password;
    }

    const operation = this.data?.mode === 'edit' && this.data?.user
      ? this.userService.updateUser(this.data.user.id, request)
      : this.userService.createUser(request);

    operation.subscribe({
      next: (result) => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant(this.data?.mode === 'edit' ? 'USERS.UPDATE_SUCCESS' : 'USERS.ADD_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        this.dialogRef.close(result);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('USERS.ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        console.error('User error:', error);
      }
    });
  }
}
