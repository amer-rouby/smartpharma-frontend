import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductService } from '../../../core/services/product.service';
import { ProductRequest } from '../../../core/models/product.model';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PageHeaderComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  product: ProductRequest = {
    name: '',
    scientificName: '',
    barcode: '',
    category: '',
    unitType: 'BOX',
    minStockLevel: 10,
    prescriptionRequired: false,
    sellPrice: 0,
    buyPrice: 0
  };

  loading = false;
  isEditMode = false;
  productId: number | null = null;

  categories = [
    'مسكنات',
    'مضادات حيوية',
    'قلب وأوعية',
    'معدة',
    'حساسية',
    'فيتامينات',
    'مستحضرات تجميل',
    'أخرى'
  ];

  unitTypes = [
    { value: 'BOX', label: 'علبة' },
    { value: 'STRIP', label: 'شريط' },
    { value: 'TABLET', label: 'قرص' },
    { value: 'BOTTLE', label: 'زجاجة' },
    { value: 'TUBE', label: 'أنبوبة' },
    { value: 'PACKET', label: 'كيس' }
  ];

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProduct();
      } else {
        this.generateUniqueBarcode();
      }
    });
  }

  generateUniqueBarcode(): void {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.product.barcode = `PH-${timestamp}-${random}`;
  }

  loadProduct(): void {
    if (this.productId) {
      this.loading = true;
      this.productService.getProduct(this.productId).subscribe({
        next: (response: any) => {
          const data = response.data;
          this.product = {
            name: data.name || '',
            scientificName: data.scientificName || '',
            barcode: data.barcode || '',
            category: data.category || '',
            unitType: data.unitType || 'BOX',
            minStockLevel: data.minStockLevel || 10,
            prescriptionRequired: data.prescriptionRequired || false,
            sellPrice: data.sellPrice || 0,
            buyPrice: data.buyPrice || 0
          };
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('حدث خطأ أثناء تحميل المنتج', 'إغلاق', { duration: 3000 });
          this.router.navigate(['/products']);
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.product.name?.trim()) {
      this.snackBar.open('يرجى إدخال اسم المنتج', 'إغلاق', { duration: 3000 });
      return;
    }

    if (!this.product.sellPrice || this.product.sellPrice <= 0) {
      this.snackBar.open('يرجى إدخال سعر البيع', 'إغلاق', { duration: 3000 });
      return;
    }

    this.loading = true;

    const request$ = this.isEditMode && this.productId
      ? this.productService.updateProduct(this.productId, this.product)
      : this.productService.createProduct(this.product);

    request$.subscribe({
      next: (response: any) => {
        this.loading = false;
        this.snackBar.open(response.message || (this.isEditMode ? 'تم تحديث المنتج' : 'تم إضافة المنتج'), 'إغلاق', { duration: 3000 });
        this.router.navigate(['/products']);
      },
      error: (error: any) => {
        this.loading = false;
        this.snackBar.open(error.error?.message || 'حدث خطأ', 'إغلاق', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  regenerateBarcode(): void {
    this.generateUniqueBarcode();
    this.snackBar.open('تم توليد باركود جديد', 'إغلاق', { duration: 2000 });
  }
}
