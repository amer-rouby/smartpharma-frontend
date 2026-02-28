import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { StockBatchService } from '../../../core/services/stock.service';
import { Product } from '../../../core/models/product.model';
import { StockBatch } from '../../../core/models/stock.model';

@Component({
  selector: 'app-stock-batch-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    PageHeaderComponent
  ],
  templateUrl: './stock-batch-form.component.html',
  styleUrl: './stock-batch-form.component.scss'
})
export class StockBatchFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly stockBatchService = inject(StockBatchService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly isEditMode = signal(false);
  readonly batchId = signal<number | null>(null);
  readonly productsList = computed(() => {
    const prods = this.products();
    return Array.isArray(prods) ? prods : [];
  });

  batchForm: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
    this.checkEditMode();
  }

  private initForm(): void {
    this.batchForm = this.fb.group({
      productId: ['', Validators.required],
      batchNumber: ['', [Validators.required, Validators.minLength(3)]],
      quantityCurrent: [0, [Validators.required, Validators.min(0)]],
      quantityInitial: [0, [Validators.min(0)]],
      expiryDate: [null, Validators.required],
      productionDate: [null],
      location: [''],
      shelf: [''],
      warehouse: [''],
      notes: [''],
      status: ['ACTIVE']
    });
  }

  private loadProducts(): void {
    this.stockBatchService.getProducts().subscribe({
      next: (response: any) => {
        let productsList: Product[] = [];

        if (Array.isArray(response)) {
          productsList = response;
        } else if (response?.data && Array.isArray(response.data)) {
          productsList = response.data;
        } else if (response?.content && Array.isArray(response.content)) {
          productsList = response.content;
        } else if (response?.products && Array.isArray(response.products)) {
          productsList = response.products;
        }

        this.products.set(productsList);
      },
      error: (error: unknown) => {
        console.error('Error loading products:', error);
        this.products.set([]);
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.batchId.set(+id);
      this.loadBatchData(+id);
    }
  }

  private loadBatchData(id: number): void {
    this.loading.set(true);

    this.stockBatchService.getBatch(id).subscribe({
      next: (response: any) => {
        let batch: StockBatch;

        if (response?.data) {
          batch = response.data;
        } else if (response?.content) {
          batch = response.content;
        } else {
          batch = response;
        }

        this.batchForm.patchValue({
          productId: batch.productId,
          batchNumber: batch.batchNumber,
          quantityCurrent: batch.quantityCurrent,
          quantityInitial: batch.quantityInitial,
          expiryDate: batch.expiryDate ? new Date(batch.expiryDate) : null,
          productionDate: batch.productionDate ? new Date(batch.productionDate) : null,
          location: batch.location || '',
          shelf: batch.shelf || '',
          warehouse: batch.warehouse || '',
          notes: batch.notes || '',
          status: batch.status || 'ACTIVE'
        });

        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.snackBar.open('فشل في تحميل بيانات الدفعة', 'إغلاق', { duration: 3000 });
        this.loading.set(false);
        this.router.navigate(['/stock']);
      }
    });
  }

  onSubmit(): void {
    if (this.batchForm.invalid) {
      this.batchForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formData: Partial<StockBatch> = { ...this.batchForm.value, pharmacyId: 4 };

    if (this.isEditMode() && this.batchId()) {
      this.stockBatchService.updateBatch(this.batchId()!, formData).subscribe({
        next: () => {
          this.snackBar.open('Batch updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/stock']);
        },
        error: (error: unknown) => {
          console.error('Error updating batch:', error);
          this.snackBar.open('Failed to update batch', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    } else {
      this.stockBatchService.createBatch(formData).subscribe({
        next: () => {
          this.snackBar.open('Batch added successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/stock']);
        },
        error: (error: unknown) => {
          console.error('Error creating batch:', error);
          this.snackBar.open('Failed to add batch', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/stock']);
  }
}
