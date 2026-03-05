import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../shared/material.module';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRequest, UserRole } from '../../core/models/user.model';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, FormsModule, ConfirmDialogComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');

  readonly displayedColumns = ['fullName', 'email', 'role', 'isActive', 'lastLoginAt', 'actions'];
  readonly userRoles = [
    { value: UserRole.ADMIN, label: 'USERS.ADMIN' },
    { value: UserRole.PHARMACIST, label: 'USERS.PHARMACIST' },
    { value: UserRole.MANAGER, label: 'USERS.MANAGER' },
    { value: UserRole.VIEWER, label: 'USERS.VIEWER' }
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);

    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorHandler.handleHttpError(err, 'USERS.LOAD_ERROR');
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery();

    if (query.trim()) {
      this.userService.searchUsers(query).subscribe({
        next: (data) => this.users.set(data),
        error: (err) => this.errorHandler.handleHttpError(err, 'USERS.LOAD_ERROR')
      });
    } else {
      this.loadUsers();
    }
  }

  onAdd(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: {
        pharmacyId: this.authService.getPharmacyId(),
        mode: 'add'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  onEdit(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: {
        user: user,
        pharmacyId: user.pharmacyId,
        mode: 'edit'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  onDelete(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('USERS.CONFIRM_DELETE', { name: user.fullName }),
        confirmText: this.translate.instant('COMMON.YES'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.users.update(users => users.filter(u => u.id !== user.id));
            this.errorHandler.showSuccess('USERS.DELETE_SUCCESS', { params: { name: user.fullName } });
          },
          error: (err) => {
            this.errorHandler.handleHttpError(err, 'USERS.DELETE_ERROR');
          }
        });
      }
    });
  }

  toggleActive(user: User): void {
    const updated: UserRequest = {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      pharmacyId: user.pharmacyId,
      isActive: !user.isActive
    };

    this.userService.updateUser(user.id, updated).subscribe({
      next: (data) => {
        this.users.update(users =>
          users.map(u => u.id === user.id ? data : u)
        );
        this.errorHandler.showSuccess('USERS.STATUS_UPDATED');
      },
      error: (err) => {
        this.errorHandler.handleHttpError(err, 'USERS.STATUS_ERROR');
      }
    });
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.ADMIN]: this.translate.instant('USERS.ADMIN'),
      [UserRole.PHARMACIST]: this.translate.instant('USERS.PHARMACIST'),
      [UserRole.MANAGER]: this.translate.instant('USERS.MANAGER'),
      [UserRole.VIEWER]: this.translate.instant('USERS.VIEWER')
    };
    return labels[role] || role;
  }

  getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      [UserRole.ADMIN]: '#ef4444',
      [UserRole.PHARMACIST]: '#3b82f6',
      [UserRole.MANAGER]: '#f59e0b',
      [UserRole.VIEWER]: '#10b981'
    };
    return colors[role] || '#6b7280';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
