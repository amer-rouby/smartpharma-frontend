import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';


@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MaterialModule
  ],
  template: `
    <div mat-dialog-class="confirm-dialog">
      <div mat-dialog-content>
        <mat-icon color="warn">warning</mat-icon>
        <h2 mat-dialog-title>{{data.title}}</h2>
        <p>{{data.message}}</p>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{data.cancelText || 'إلغاء'}}
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          {{data.confirmText || 'تأكيد'}}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      h2 {
        margin: 8px 0;
      }

      p {
        color: #666;
        margin: 16px 0;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
