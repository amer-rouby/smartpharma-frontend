import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; {{currentYear}} صيدليتي الذكية - جميع الحقوق محفوظة</p>
        <p class="version">الإصدار {{version}}</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #fff;
      border-top: 1px solid #e0e0e0;
      padding: 16px 24px;
      text-align: center;

      .footer-content {
        p {
          margin: 4px 0;
          color: #666;
          font-size: 14px;

          &.version {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  version = '1.0.0';
}
