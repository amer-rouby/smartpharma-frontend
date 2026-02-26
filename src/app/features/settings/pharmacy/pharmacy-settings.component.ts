import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { PharmacySettingsService } from '../../../core/services/settings/pharmacy-settings.service';
import { PharmacySettings, PharmacySettingsRequest } from '../../../core/models/settings/pharmacy-settings.model';

@Component({
  selector: 'app-pharmacy-settings',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, ReactiveFormsModule],
  templateUrl: './pharmacy-settings.component.html',
  styleUrl: './pharmacy-settings.component.scss'
})
export class PharmacySettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly pharmacySettingsService = inject(PharmacySettingsService);

  readonly loading = signal(false);
  readonly form: FormGroup;

  readonly currencies = ['EGP', 'USD', 'EUR', 'SAR'];
  readonly timezones = [
    { value: 'Africa/Cairo', label: 'القاهرة' },
    { value: 'Asia/Riyadh', label: 'الرياض' },
    { value: 'Asia/Dubai', label: 'دبي' }
  ];
  readonly dateFormats = [
    { value: 'dd/MM/yyyy', label: 'يوم/شهر/سنة' },
    { value: 'MM/dd/yyyy', label: 'شهر/يوم/سنة' },
    { value: 'yyyy-MM-dd', label: 'سنة-شهر-يوم' }
  ];
  readonly timeFormats = [
    { value: '24h', label: '24 ساعة' },
    { value: '12h', label: '12 ساعة' }
  ];

  constructor() {
    this.form = this.fb.group({
      pharmacyName: ['', [Validators.required, Validators.maxLength(100)]],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
      licenseNumber: [''],
      taxNumber: [''],
      commercialRegister: [''],
      logoUrl: [''],
      currency: ['EGP'],
      timezone: ['Africa/Cairo'],
      dateFormat: ['dd/MM/yyyy'],
      timeFormat: ['24h'],
      emailNotifications: [true],
      smsNotifications: [false],
      lowStockAlerts: [true],
      expiryAlerts: [true]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);

    this.pharmacySettingsService.getSettings().subscribe({
      next: (data) => {
        this.form.patchValue({
          pharmacyName: data.pharmacyName,
          address: data.address,
          phone: data.phone,
          email: data.email,
          licenseNumber: data.licenseNumber,
          taxNumber: data.taxNumber,
          commercialRegister: data.commercialRegister,
          logoUrl: data.logoUrl,
          currency: data.currency,
          timezone: data.timezone,
          dateFormat: data.dateFormat,
          timeFormat: data.timeFormat,
          emailNotifications: data.emailNotifications,
          smsNotifications: data.smsNotifications,
          lowStockAlerts: data.lowStockAlerts,
          expiryAlerts: data.expiryAlerts
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.snackBar.open(
          this.translate.instant('SETTINGS.LOAD_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.snackBar.open(
        this.translate.instant('VALIDATION.REQUIRED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    this.loading.set(true);
    const request: PharmacySettingsRequest = this.form.value;

    this.pharmacySettingsService.updateSettings(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('SETTINGS.SAVE_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open(
          this.translate.instant('SETTINGS.SAVE_ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
        console.error('Save error:', error);
      }
    });
  }

  onCancel(): void {
    this.loadSettings();
  }
}
