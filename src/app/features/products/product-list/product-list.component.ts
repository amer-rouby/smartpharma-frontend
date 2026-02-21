import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductService } from '../../../core/services/product.service';
import Swal from 'sweetalert2';
import { Product } from '../../../core/models/product.model';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MaterialModule,
    FormsModule,
    PageHeaderComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['name', 'barcode', 'category', 'stock', 'price', 'actions'];
  searchQuery: string = '';
  loading: boolean = false;
  selectedCategory: string = 'all';
  categories: string[] = ['all'];

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        this.products = response.data || [];
        this.extractCategories();
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.snackBar.open('حدث خطأ أثناء تحميل المنتجات', 'إغلاق', { duration: 3000 });
      }
    });
  }

  extractCategories(): void {
    const cats = new Set<string>();
    this.products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    this.categories = ['all', ...Array.from(cats)];
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.productService.searchProducts(this.searchQuery).subscribe({
        next: (response: any) => {
          this.products = response.data || [];
        }
      });
    } else {
      this.loadProducts();
    }
  }

  filterByCategory(): void {
    if (this.selectedCategory === 'all') {
      this.loadProducts();
    } else {
      this.products = this.products.filter(p => p.category === this.selectedCategory);
    }
  }

  onDelete(product: Product): void {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: `هل تريد حذف المنتج "${product.name}"؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.loadProducts();
            Swal.fire('تم الحذف!', 'تم حذف المنتج بنجاح.', 'success');
          },
          error: () => {
            Swal.fire('خطأ!', 'حدث خطأ أثناء الحذف.', 'error');
          }
        });
      }
    });
  }

  getStockColor(stock: number): 'primary' | 'accent' | 'warn' {
    if (stock <= 10) return 'warn';
    if (stock <= 20) return 'accent';
    return 'primary';
  }

  getStockStatus(stock: number): string {
    if (stock <= 10) return 'منخفض';
    if (stock <= 20) return 'متوسط';
    return 'جيد';
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadProducts();
  }
}
