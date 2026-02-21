import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-overlay" *ngIf="isLoading">
      <mat-progress-spinner
        color="primary"
        mode="indeterminate"
        diameter="50">
      </mat-progress-spinner>
      <p class="loading-text">جاري التحميل...</p>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;

      .loading-text {
        color: white;
        margin-top: 16px;
        font-size: 16px;
        font-weight: 600;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  isLoading = false;
}
