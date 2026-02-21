import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  template: `
    <div class="page-header">
      <div class="header-content">
        <mat-icon *ngIf="icon">{{icon}}</mat-icon>
        <div>
          <h1>{{title}}</h1>
          <p *ngIf="subtitle">{{subtitle}}</p>
        </div>
      </div>
      <div class="header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      .header-content {
        display: flex;
        align-items: center;
        gap: 16px;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: #667eea;
        }

        h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        p {
          margin: 4px 0 0 0;
          color: #666;
          font-size: 14px;
        }
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
}
