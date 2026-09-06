import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { TableLoadingComponent } from '../../shared/components/table-loading/table-loading.component';
import { MaterialModule } from '../../shared/material.module';
import { CrudPageWithDialogDirective } from '../../core/crud';
import { UserRole } from '../../core/models/user.model';
import { UserCrudService } from './services/user-crud.service';
import { UserModel } from './models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, FormsModule, EmptyStateComponent, TableLoadingComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent extends CrudPageWithDialogDirective<UserModel, UserCrudService> {
  readonly service = inject(UserCrudService);

  readonly displayedColumns = ['fullName', 'email', 'role', 'isActive', 'lastLoginAt', 'actions'];
  readonly userRoles = [
    { value: UserRole.ADMIN, label: 'USERS.ADMIN' },
    { value: UserRole.PHARMACIST, label: 'USERS.PHARMACIST' },
    { value: UserRole.MANAGER, label: 'USERS.MANAGER' },
    { value: UserRole.VIEWER, label: 'USERS.VIEWER' },
  ];

  readonly hasPagination = computed(() => this.totalElements() > this.pageSize());

  protected override getDeleteConfirmMessage(user: UserModel): string {
    return this.translate.instant('USERS.CONFIRM_DELETE', { name: user.fullName });
  }

  protected override getDeleteSuccessKey(): string {
    return 'USERS.DELETE_SUCCESS';
  }

  protected override getDeleteErrorKey(): string {
    return 'USERS.DELETE_ERROR';
  }

  protected override getDeleteMessageParams(user: UserModel): Record<string, unknown> {
    return { name: user.fullName };
  }

  toggleActive(user: UserModel): void {
    const updated = user.clone<UserModel>({ isActive: !user.isActive });
    updated.save().subscribe({
      next: () => {
        this.errorHandler.showSuccess('USERS.STATUS_UPDATED');
        this.refresh();
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'USERS.STATUS_ERROR'),
    });
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.ADMIN]: this.translate.instant('USERS.ADMIN'),
      [UserRole.PHARMACIST]: this.translate.instant('USERS.PHARMACIST'),
      [UserRole.MANAGER]: this.translate.instant('USERS.MANAGER'),
      [UserRole.VIEWER]: this.translate.instant('USERS.VIEWER'),
    };
    return labels[role] || role;
  }

  getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      [UserRole.ADMIN]: '#ef4444',
      [UserRole.PHARMACIST]: '#3b82f6',
      [UserRole.MANAGER]: '#f59e0b',
      [UserRole.VIEWER]: '#10b981',
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
      minute: '2-digit',
    });
  }
}
