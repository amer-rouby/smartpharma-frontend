import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { PurchaseOrder } from '../../../core/models/purchase-order.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, RouterLink, CommonModule],
  templateUrl: './purchase-detail.component.html',
  styleUrl: './purchase-detail.component.scss'
})
export class PurchaseDetailComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseOrderService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly order = signal<PurchaseOrder | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadOrder(+id);
  }

  loadOrder(id: number): void {
    this.loading.set(true);
    this.purchaseService.getOrder(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.showError('PURCHASES.LOAD_ERROR');
        this.router.navigate(['/purchases']);
      }
    });
  }

  onEdit(): void {
    if (this.order()?.status === 'DRAFT') {
      this.router.navigate(['/purchases', this.order()?.id, 'edit']);
    } else {
      this.showError('PURCHASES.EDIT_DRAFT_ONLY');
    }
  }

  onDelete(): void {
    if (this.order()?.status !== 'DRAFT') {
      this.showError('PURCHASES.DELETE_DRAFT_ONLY');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: this.translate.instant('PURCHASES.CONFIRM_DELETE'),
        message: this.translate.instant('PURCHASES.CONFIRM_DELETE_MSG', { order: this.order()!.orderNumber }),
        confirmText: this.translate.instant('COMMON.DELETE'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.purchaseService.deleteOrder(this.order()!.id).subscribe({
          next: () => {
            this.showSuccess('PURCHASES.DELETED');
            this.router.navigate(['/purchases']);
          },
          error: () => this.showError('PURCHASES.DELETE_ERROR')
        });
      }
    });
  }

  onApprove(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: this.translate.instant('PURCHASES.CONFIRM_APPROVE'),
        message: this.translate.instant('PURCHASES.CONFIRM_APPROVE_MSG', { order: this.order()!.orderNumber }),
        confirmText: this.translate.instant('PURCHASES.APPROVE'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        color: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.purchaseService.approveOrder(this.order()!.id).subscribe({
          next: () => {
            this.showSuccess('PURCHASES.APPROVED');
            this.loadOrder(this.order()!.id);
          },
          error: () => this.showError('PURCHASES.APPROVE_ERROR')
        });
      }
    });
  }

  onReceive(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('PURCHASES.CONFIRM_RECEIVE'),
        message: this.translate.instant('PURCHASES.CONFIRM_RECEIVE_MSG', { order: this.order()!.orderNumber }),
        confirmText: this.translate.instant('PURCHASES.RECEIVE'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        color: 'accent'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.purchaseService.receiveOrder(this.order()!.id).subscribe({
          next: () => {
            this.showSuccess('PURCHASES.RECEIVED');
            this.loadOrder(this.order()!.id);
          },
          error: () => this.showError('PURCHASES.RECEIVE_ERROR')
        });
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'DRAFT': '#6b7280',
      'PENDING': '#f59e0b',
      'APPROVED': '#3b82f6',
      'RECEIVED': '#10b981',
      'CANCELLED': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(this.translate.instant(message), this.translate.instant('COMMON.CLOSE'), {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(this.translate.instant(message), this.translate.instant('COMMON.CLOSE'), {
      duration: 3000
    });
  }
}
