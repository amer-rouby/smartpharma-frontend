import { Component, inject, signal, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { PurchaseOrder } from '../../../core/models/purchase-order.model';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, RouterLink, MatTableModule, MatPaginatorModule],
  templateUrl: './purchase-orders.component.html',
  styleUrl: './purchase-orders.component.scss'
})
export class PurchaseOrdersComponent implements OnInit, AfterViewInit {
  private readonly purchaseService = inject(PurchaseOrderService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly stats = signal<any>(null);

  displayedColumns: string[] = ['orderNumber', 'supplier', 'orderDate', 'totalAmount', 'status', 'priority', 'actions'];
  dataSource = new MatTableDataSource<PurchaseOrder>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadOrders();
    this.loadStats();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadOrders(): void {
    this.loading.set(true);
    this.purchaseService.getOrders(0, 10).subscribe({
      next: (data) => {
        this.dataSource.data = data.content || [];
        this.loading.set(false);
      },
      error: () => {
        this.showError('PURCHASES.LOAD_ERROR');
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.purchaseService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: () => console.error('Error loading stats')
    });
  }

  onView(order: PurchaseOrder): void {
    this.router.navigate(['/purchases', order.id]);
  }

  onEdit(order: PurchaseOrder): void {
    if (order.status === 'DRAFT') {
      this.router.navigate(['/purchases', order.id, 'edit']);
    } else {
      this.showError('PURCHASES.EDIT_DRAFT_ONLY');
    }
  }

  onDelete(order: PurchaseOrder): void {
    if (order.status !== 'DRAFT') {
      this.showError('PURCHASES.DELETE_DRAFT_ONLY');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: this.translate.instant('PURCHASES.CONFIRM_DELETE'),
        message: this.translate.instant('PURCHASES.CONFIRM_DELETE_MSG', { order: order.orderNumber }),
        confirmText: this.translate.instant('COMMON.DELETE'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.purchaseService.deleteOrder(order.id).subscribe({
          next: () => {
            this.showSuccess('PURCHASES.DELETED');
            this.loadOrders();
            this.loadStats();
          },
          error: () => this.showError('PURCHASES.DELETE_ERROR')
        });
      }
    });
  }

  onApprove(order: PurchaseOrder): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: this.translate.instant('PURCHASES.CONFIRM_APPROVE'),
        message: this.translate.instant('PURCHASES.CONFIRM_APPROVE_MSG', { order: order.orderNumber }),
        confirmText: this.translate.instant('PURCHASES.APPROVE'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        color: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.purchaseService.approveOrder(order.id).subscribe({
          next: () => {
            this.showSuccess('PURCHASES.APPROVED');
            this.loadOrders();
            this.loadStats();
          },
          error: () => this.showError('PURCHASES.APPROVE_ERROR')
        });
      }
    });
  }

  onReceive(order: PurchaseOrder): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('PURCHASES.CONFIRM_RECEIVE'),
        message: this.translate.instant('PURCHASES.CONFIRM_RECEIVE_MSG', { order: order.orderNumber }),
        confirmText: this.translate.instant('PURCHASES.RECEIVE'),
        cancelText: this.translate.instant('COMMON.CANCEL'),
        color: 'accent'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.purchaseService.receiveOrder(order.id).subscribe({
          next: () => {
            this.showSuccess('PURCHASES.RECEIVED');
            this.loadOrders();
            this.loadStats();
          },
          error: () => this.showError('PURCHASES.RECEIVE_ERROR')
        });
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'PURCHASES.STATUS.DRAFT',
      'PENDING': 'PURCHASES.STATUS.PENDING',
      'APPROVED': 'PURCHASES.STATUS.APPROVED',
      'RECEIVED': 'PURCHASES.STATUS.RECEIVED',
      'CANCELLED': 'PURCHASES.STATUS.CANCELLED'
    };
    return this.translate.instant(labels[status] || status);
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

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'LOW': '#10b981',
      'NORMAL': '#3b82f6',
      'URGENT': '#ef4444'
    };
    return colors[priority] || '#6b7280';
  }

  formatDate(date: string): string {
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
