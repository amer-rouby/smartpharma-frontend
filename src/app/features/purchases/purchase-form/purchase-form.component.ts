import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ProductService } from '../../../core/services/product.service';
import { Supplier } from '../../../core/models/purchase-order.model';
import { Product } from '../../../core/models/product.model';

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
  private readonly productService = inject(ProductService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly loading = signal(false);
  readonly suppliers = signal<Supplier[]>([]);
  readonly products = signal<Product[]>([]);
  readonly form: FormGroup;
  readonly isEditMode = signal(false);
  readonly orderId = signal<number | null>(null);
  readonly todayDate = signal<string>(new Date().toISOString().split('T')[0]);

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

  get itemsFormArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get itemsControls(): AbstractControl[] {
    return this.itemsFormArray.controls;
  }

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
    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => this.suppliers.set(data || []),
      error: (err) => this.errorHandler.handleHttpError(err, 'SUPPLIERS.LOAD_ERROR')
    });
  }

  loadProducts(): void {
    this.productService.getProductsList().subscribe({
      next: (response: any) => {
        if (response && response.success && Array.isArray(response.data)) {
          this.products.set(response.data);
        } else if (Array.isArray(response)) {
          this.products.set(response);
        } else {
          console.error('Unexpected data structure:', response);
          this.products.set([]);
        }
      },
      error: (err) => {
        console.error('Error loading products from server:', err);
        this.errorHandler.handleHttpError(err, 'PRODUCTS.LOAD_ERROR');
        this.products.set([]);
      }
    });
  }

  loadOrder(id: number): void {
    this.loading.set(true);
    this.purchaseService.getOrder(id).subscribe({
      next: (order) => {
        this.form.patchValue(order);
        this.itemsFormArray.clear();
        order.items?.forEach(item => this.addItem(item));
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorHandler.handleHttpError(err, 'PURCHASES.LOAD_ERROR');
      }
    });
  }

  addItem(item?: any): void {
    this.itemsFormArray.push(this.fb.group({
      productId: [item?.productId || null, Validators.required],
      productName: [item?.productName || ''],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      notes: [item?.notes || '']
    }));
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
  }

  onProductChange(index: number, productId: number): void {
    const product = this.products().find(p => p.id === productId);
    if (product) {
      const itemGroup = this.itemsFormArray.at(index) as FormGroup;
      itemGroup.patchValue({
        productName: product.name,
        unitPrice: product.buyPrice || 0
      });
    }
  }

  calculateItemTotal(itemValue: any): number {
    return (itemValue?.quantity || 0) * (itemValue?.unitPrice || 0);
  }

  get orderTotal(): number {
    return this.itemsFormArray.value.reduce((sum: number, item: any) => sum + this.calculateItemTotal(item), 0);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorHandler.showWarning('VALIDATION.REQUIRED');
      return;
    }

    this.loading.set(true);
    const call = this.isEditMode()
      ? this.purchaseService.updateOrder(this.orderId()!, this.form.value)
      : this.purchaseService.createOrder(this.form.value);

    call.subscribe({
      next: (order) => {
        this.loading.set(false);
        const successKey = this.isEditMode() ? 'PURCHASES.UPDATE_SUCCESS' : 'PURCHASES.CREATE_SUCCESS';
        this.errorHandler.showSuccess(successKey);
        this.router.navigate(['/purchases', order.id]);
      },
      error: (err) => {
        this.loading.set(false);
        const errorKey = this.isEditMode() ? 'PURCHASES.UPDATE_ERROR' : 'PURCHASES.CREATE_ERROR';
        this.errorHandler.handleHttpError(err, errorKey);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/purchases']);
  }
}
