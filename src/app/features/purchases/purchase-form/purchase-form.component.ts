import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { Supplier } from '../../../core/models/purchase-order.model';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [
    MaterialModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './purchase-form.component.html',
  styleUrl: './purchase-form.component.scss'
})
export class PurchaseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly purchaseService = inject(PurchaseOrderService);
  private readonly supplierService = inject(SupplierService);

  readonly loading = signal(false);
  readonly suppliers = signal<Supplier[]>([]);
  readonly form: FormGroup;
  readonly isEditMode = signal(false);
  readonly orderId = signal<number | null>(null);
  readonly todayDate = signal<string>(new Date().toISOString().split('T')[0]);

  readonly products = signal<any[]>([]);

  constructor() {
    this.form = this.fb.group({
      supplierId: [null, Validators.required],
      orderDate: [this.todayDate(), Validators.required],
      expectedDeliveryDate: [''],
      priority: ['NORMAL'],
      paymentTerms: [''],
      notes: [''],
      sourceType: ['MANUAL'],
      sourceId: [null],
      items: this.fb.array([], Validators.required)
    });
  }

  get items(): FormArray { return this.form.get('items') as FormArray; }

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadProducts();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.orderId.set(+id);
      this.loadOrder(+id);
    }
  }

  loadSuppliers(): void {
    console.log('🔄 Loading suppliers for pharmacy...');
    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers.set(data || []);
      },
      error: (error) => {
        console.error('❌ Error loading suppliers:', error);
        this.snackBar.open(
          this.translate.instant('SUPPLIERS.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      }
    });
  }

  loadProducts(): void {
    this.products.set([
      { id: 16, name: 'بنادول إكسترا' },
      { id: 17, name: 'أوجمنت 1 جم' },
      { id: 18, name: 'كونكور 5 مجم' },
      { id: 19, name: 'أوميبرازول 20 مجم' },
      { id: 20, name: 'فولتارين 50 مجم' }
    ]);
  }

  loadOrder(id: number): void {
    this.loading.set(true);
    this.purchaseService.getOrder(id).subscribe({
      next: (order) => {
        this.form.patchValue({
          supplierId: order.supplierId,
          orderDate: order.orderDate,
          expectedDeliveryDate: order.expectedDeliveryDate,
          priority: order.priority,
          paymentTerms: order.paymentTerms,
          notes: order.notes,
          sourceType: order.sourceType,
          sourceId: order.sourceId
        });
        this.items.clear();
        order.items?.forEach(item => this.addItem(item));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.snackBar.open(
          this.translate.instant('PURCHASES.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        this.loading.set(false);
      }
    });
  }

  addItem(item?: any): void {
    this.items.push(this.fb.group({
      productId: [item?.productId || null, Validators.required],
      productName: [item?.productName || ''],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      notes: [item?.notes || '']
    }));
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onProductChange(index: number, productId: number): void {
    const product = this.products().find(p => p.id === productId);
    if (product) {
      const item = this.items.at(index) as FormGroup;
      item.patchValue({
        productName: product.name
      });
    }
  }

  calculateItemTotal(item: any): number {
    const qty = item?.quantity || 0;
    const price = item?.unitPrice || 0;
    return qty * price;
  }

  get orderTotal(): number {
    return this.items.controls.reduce((sum, ctrl) => sum + this.calculateItemTotal(ctrl.value), 0);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.snackBar.open(
        this.translate.instant('VALIDATION.REQUIRED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    this.loading.set(true);
    const request = { ...this.form.value, items: this.items.value };

    const call = this.isEditMode()
      ? this.purchaseService.updateOrder(this.orderId()!, request)
      : this.purchaseService.createOrder(request);

    call.subscribe({
      next: (order) => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant(this.isEditMode() ? 'PURCHASES.UPDATE_SUCCESS' : 'PURCHASES.CREATE_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.router.navigate(['/purchases', order.id]);
      },
      error: (error) => {
        console.error('Error saving order:', error);
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant(this.isEditMode() ? 'PURCHASES.UPDATE_ERROR' : 'PURCHASES.CREATE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/purchases']);
  }
}
