import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { PharmacySettingsService } from '../../../core/services/settings/pharmacy-settings.service';
import { PharmacySettings } from '../../../core/models/settings/pharmacy-settings.model';
import { signal } from '@angular/core';

@Component({
  selector: 'app-sale-details-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule, TranslateModule],
  templateUrl: './sale-details-dialog.component.html',
  styleUrl: './sale-details-dialog.component.scss'
})
export class SaleDetailsDialogComponent {
  private readonly pharmacySettingsService = inject(PharmacySettingsService);
  readonly pharmacySettings = signal<PharmacySettings | null>(null);

  constructor(
    public dialogRef: MatDialogRef<SaleDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sale: any }
  ) {
    this.loadPharmacySettings();
  }

  private loadPharmacySettings(): void {
    this.pharmacySettingsService.getSettings().subscribe({
      next: (settings) => this.pharmacySettings.set(settings),
      error: (err) => {
        console.error('Failed to load pharmacy settings:', err);
        this.pharmacySettings.set(this.getDefaultPharmacyInfo());
      }
    });
  }

  private getDefaultPharmacyInfo(): PharmacySettings {
    return {
      id: 1,
      pharmacyId: 1,
      pharmacyName: 'صيدليتي الذكية',
      address: '',
      phone: '',
      email: '',
      licenseNumber: '',
      taxNumber: '',
      commercialRegister: '',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      dateFormat: 'dd/MM/yyyy',
      timeFormat: '24h',
      emailNotifications: true,
      smsNotifications: true,
      lowStockAlerts: true,
      expiryAlerts: true
    };
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      'CASH': 'نقدي',
      'VISA': 'فيزا',
      'MASTERCARD': 'ماستركارد',
      'CREDIT_CARD': 'بطاقة ائتمان',
      'DEBIT_CARD': 'بطاقة خصم',
      'ONLINE': 'دفع إلكتروني',
      'INSURANCE': 'تأمين',
      'WALLET': 'محفظة إلكترونية'
    };
    return labels[method] || method;
  }

  printInvoice(): void {
    window.print();
  }
}
