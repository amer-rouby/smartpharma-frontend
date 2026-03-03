import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import { FormsModule } from '@angular/forms';

export interface UpdatePredictionDTO {
  predictedQuantity?: number;
  confidenceLevel?: number;
  recommendation?: string;
  notes?: string;
}

@Component({
  selector: 'app-edit-prediction-dialog',
  standalone: true,
  imports: [MaterialModule, FormsModule],
  template: `
    <div class="edit-dialog">
      <h2 mat-dialog-title>{{ 'PREDICTIONS.EDIT_PREDICTION' | translate }}</h2>

      <mat-dialog-content>
        <div class="form-group">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'PREDICTIONS.COLUMN.PREDICTED' | translate }}</mat-label>
            <input matInput type="number" [(ngModel)]="data.prediction.predictedQuantity">
          </mat-form-field>
        </div>

        <div class="form-group">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'PREDICTIONS.COLUMN.CONFIDENCE' | translate }}</mat-label>
            <input matInput type="number" min="0" max="1" step="0.01"
                   [(ngModel)]="data.prediction.confidenceLevel">
            <mat-hint>{{ 'PREDICTIONS.CONFIDENCE_HINT' | translate }}</mat-hint>
          </mat-form-field>
        </div>

        <div class="form-group">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'PREDICTIONS.RECOMMENDATION' | translate }}</mat-label>
            <textarea matInput rows="3" [(ngModel)]="data.prediction.recommendation"></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ 'COMMON.CANCEL' | translate }}
        </button>
        <button mat-raised-button color="primary" (click)="onSave()">
          {{ 'COMMON.SAVE' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .edit-dialog { padding: 20px; }
    .form-group { margin-bottom: 16px; }
    .full-width { width: 100%; }
  `]
})
export class EditPredictionDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EditPredictionDialogComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const updates: UpdatePredictionDTO = {
      predictedQuantity: this.data.prediction.predictedQuantity,
      confidenceLevel: this.data.prediction.confidenceLevel,
      recommendation: this.data.prediction.recommendation
    };
    this.dialogRef.close(updates);
  }
}
