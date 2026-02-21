import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SalesService } from '../../../core/services/sales.service';
import { AuthService } from '../../../core/services/auth.service';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MaterialModule,
    PageHeaderComponent
  ],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss'
})
export class SalesHistoryComponent implements OnInit {
  private readonly salesService = inject(SalesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);

  displayedColumns: string[] = ['invoiceNumber', 'date', 'items', 'total', 'paymentMethod', 'actions'];
  sales: any[] = [];
  loading = false;
  searchQuery = '';
  page = 0;
  size = 10;
  totalElements = 0;

  ngOnInit(): void {
    this.loadSales();
  }

  private getPharmacyId(): number {
    return this.authService.getPharmacyId() || 1;
  }

  loadSales(): void {
    this.loading = true;
    const pharmacyId = this.getPharmacyId();

    // ✅ getAllSales(pharmacyId: number, page: number, size: number)
    this.salesService.getAllSales(pharmacyId, this.page, this.size).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.sales = data.content || data.sales || [];
        this.totalElements = data.totalElements || this.sales.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('حدث خطأ أثناء تحميل المبيعات', 'إغلاق', { duration: 3000 });
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.loading = true;
      const pharmacyId = this.getPharmacyId();

      // ✅ searchSales(pharmacyId: number, query: string)
      this.salesService.searchSales(pharmacyId, this.searchQuery.trim()).subscribe({
        next: (response: any) => {
          const data = response.data || response;
          this.sales = data.content || data.sales || [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('حدث خطأ أثناء البحث', 'إغلاق', { duration: 3000 });
        }
      });
    } else {
      this.loadSales();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadSales();
  }

  getPaymentMethodArabic(method: string): string {
    const methods: Record<string, string> = {
      'CASH': 'نقدي',
      'VISA': 'بطاقة ائتمان',
      'INSTAPAY': 'إنستا باي',
      'WALLET': 'محفظة إلكترونية',
      'CREDIT': 'آجل'
    };
    return methods[method] || method;
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.loadSales();
  }
}
