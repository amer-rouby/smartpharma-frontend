import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WhatsAppService } from '../../../core/services/whatsapp.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

export interface WhatsAppDialogData {
  orderId: number;
  orderNumber: string;
  supplierName: string;
}

@Component({
  selector: 'app-whatsapp-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './whatsapp-dialog.component.html',
  styleUrl: './whatsapp-dialog.component.scss'
})
export class WhatsAppDialogComponent {
  private readonly whatsAppService = inject(WhatsAppService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly loading = signal(false);
  readonly sending = signal(false);
  readonly sent = signal(false);
  readonly failed = signal(false);
  readonly decodedMessage = signal<string>('');
  readonly phoneNumber = signal<string>('');

  constructor(
    public dialogRef: MatDialogRef<WhatsAppDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WhatsAppDialogData
  ) {
    this.loadWhatsAppData();
  }

  private loadWhatsAppData(): void {
    this.loading.set(true);

    this.whatsAppService.getWhatsappData(this.data.orderId).subscribe({
      next: (response) => {
        if (!response || !response.phoneNumber) {
          this.failed.set(true);
          this.loading.set(false);
          return;
        }

        this.phoneNumber.set(response.phoneNumber);

        if (response.encodedMessage && response.encodedMessage.trim() !== '') {
          try {
            const decoded = decodeURIComponent(response.encodedMessage);
            this.decodedMessage.set(decoded);
          } catch {
            this.decodedMessage.set(response.encodedMessage);
          }
        } else {
          this.decodedMessage.set('');
        }

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.failed.set(true);
      }
    });
  }

  onSend(): void {
    if (this.sending() || this.sent()) return;

    this.sending.set(true);
    this.failed.set(false);

    this.whatsAppService.sendWhatsApp(this.data.orderId).subscribe({
      next: (response) => {
        this.sending.set(false);
        if (response?.success) {
          this.sent.set(true);
          setTimeout(() => this.dialogRef.close(true), 1800);
        } else {
          this.failed.set(true);
          this.errorHandler.showError('فشل إرسال الرسالة');
        }
      },
      error: (err) => {
        this.sending.set(false);
        this.failed.set(true);

        const errorMessage = err?.error?.error?.message || '';
        if (errorMessage.includes('not in allowed list') || errorMessage.includes('Recipient phone number')) {
          this.errorHandler.showError('WHATSAPP.NOT_ALLOWED');
        } else {
          this.errorHandler.handleHttpError(err, 'PURCHASES.WHATSAPP_ERROR');
        }
      }
    });
  }

  onRetry(): void {
    this.failed.set(false);
    this.loadWhatsAppData();
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}
