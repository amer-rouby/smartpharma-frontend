import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StockBatchService } from '../../../core/services/stock.service';
import { StockBatch } from '../../../core/models/stock.model';
import { TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-stock-adjustment-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MaterialModule
  ],
  template: `
    <div class="adjustment-dialog">
      <div class="dialog-header">
        <h2>{{'STOCK.ADJUST_STOCK' | translate}}</h2>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div class="batch-info">
          <p><strong>{{'PRODUCTS.NAME' | translate}}:</strong> {{data.batch.productName}}</p>
          <p><strong>{{'STOCK.BATCH_NUMBER' | translate}}:</strong> {{data.batch.batchNumber}}</p>
          <p><strong>{{'STOCK.CURRENT_QUANTITY' | translate}}:</strong> {{data.batch.quantityCurrent}}</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{'STOCK.ADJUSTMENT_TYPE' | translate}}</mat-label>
            <mat-select formControlName="type" required>
              <mat-option value="ADD">{{'STOCK.ADD' | translate}}</mat-option>
              <mat-option value="REMOVE">{{'STOCK.REMOVE' | translate}}</mat-option>
              <mat-option value="CORRECTION">{{'STOCK.CORRECTION' | translate}}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{'STOCK.QUANTITY' | translate}}</mat-label>
            <input matInput type="number" formControlName="quantity" required min="1">
            <mat-icon matPrefix>shopping_cart</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{'STOCK.REASON' | translate}}</mat-label>
            <mat-select formControlName="reason" required>
              <mat-option value="DAMAGED">{{'STOCK.DAMAGED' | translate}}</mat-option>
              <mat-option value="EXPIRED">{{'STOCK.EXPIRED' | translate}}</mat-option>
              <mat-option value="RETURNED">{{'STOCK.RETURNED' | translate}}</mat-option>
              <mat-option value="COUNT_ERROR">{{'STOCK.COUNT_ERROR' | translate}}</mat-option>
              <mat-option value="OTHER">{{'STOCK.OTHER' | translate}}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{'COMMON.NOTES' | translate}}</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
          </mat-form-field>

          <div class="dialog-actions">
            <button mat-button type="button" (click)="dialogRef.close()">
              {{'COMMON.CANCEL' | translate}}
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
              <mat-icon>save</mat-icon>
              {{'COMMON.SAVE' | translate}}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .adjustment-dialog { min-width: 500px; }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid #e9ecef;
      margin-bottom: 20px;
    }
    .dialog-header h2 { margin: 0; color: #667eea; }
    .batch-info {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .batch-info p { margin: 8px 0; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e9ecef;
    }
  `]
})
export class StockAdjustmentDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly stockService = inject(StockBatchService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  dialogRef = inject(MatDialogRef<StockAdjustmentDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  form: FormGroup;
  loading = false;

  constructor() {
    this.form = this.fb.group({
      type: ['ADD', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      reason: ['OTHER', Validators.required],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    const adjustment = {
      ...this.form.value,
      batchId: this.data.batch.id
    };

    const pharmacyId = this.data.pharmacyId || 4;

    this.stockService.adjustStock(this.data.batch.id, adjustment, pharmacyId).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('STOCK.ADJUSTMENT_SUCCESS'), 'OK', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open(this.translate.instant('STOCK.ADJUSTMENT_ERROR'), 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
