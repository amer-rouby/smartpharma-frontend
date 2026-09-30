import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MaterialModule } from '../../../shared/material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { EtaSettingsService } from '../../../core/services/settings/eta-settings.service';
import { EtaPosDevice, EtaSettings } from '../../../core/models/settings/eta-settings.model';

// ETA e-receipt setup: the pharmacy as a taxpayer (seller block + API
// credentials) and its registered POS device. Secrets are write-only - the
// server only says whether one is stored, so empty fields keep the old value.
@Component({
  selector: 'app-eta-settings',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, ReactiveFormsModule],
  templateUrl: './eta-settings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './eta-settings.component.scss'
})
export class EtaSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly etaSettingsService = inject(EtaSettingsService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly savingDevice = signal(false);
  readonly testingDeviceId = signal<number | null>(null);
  readonly settings = signal<EtaSettings | null>(null);
  readonly devices = signal<EtaPosDevice[]>([]);
  readonly editingDevice = signal<EtaPosDevice | null>(null);
  readonly showDeviceForm = signal(false);

  readonly environments = ['PREPROD', 'PROD'];

  readonly form: FormGroup = this.fb.group({
    environment: ['PREPROD', Validators.required],
    rin: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    companyTradeName: ['', Validators.required],
    branchCode: ['0', Validators.required],
    activityCode: ['', Validators.required],
    governate: ['', Validators.required],
    regionCity: ['', Validators.required],
    street: ['', Validators.required],
    buildingNumber: ['', Validators.required],
    postalCode: [''],
    clientId: ['', Validators.required],
    clientSecret: ['']
  });

  readonly deviceForm: FormGroup = this.fb.group({
    serialNumber: ['', [Validators.required, Validators.maxLength(100)]],
    osVersion: ['', [Validators.required, Validators.maxLength(50)]],
    modelFramework: ['', [Validators.required, Validators.maxLength(10)]],
    presharedKey: [''],
    active: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    forkJoin({
      settings: this.etaSettingsService.getSettings(),
      devices: this.etaSettingsService.getDevices()
    }).subscribe({
      next: ({ settings, devices }) => {
        this.settings.set(settings);
        this.devices.set(devices);
        this.form.patchValue({ ...settings, clientSecret: '' });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorHandler.handleHttpError(err, 'ETA.LOAD_ERROR');
      }
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.etaSettingsService.saveSettings({ ...value, clientSecret: value.clientSecret || undefined }).subscribe({
      next: (settings) => {
        this.settings.set(settings);
        this.form.patchValue({ clientSecret: '' });
        this.saving.set(false);
        this.errorHandler.showSuccess('SETTINGS.SAVE_SUCCESS');
      },
      error: (err) => {
        this.saving.set(false);
        this.errorHandler.handleHttpError(err, 'SETTINGS.SAVE_ERROR');
      }
    });
  }

  openDeviceForm(device?: EtaPosDevice): void {
    this.editingDevice.set(device ?? null);
    this.deviceForm.reset({
      serialNumber: device?.serialNumber ?? '',
      osVersion: device?.osVersion ?? '',
      modelFramework: device?.modelFramework ?? '',
      presharedKey: '',
      active: device?.active ?? true
    });
    // The receipt chain is tied to the serial - it can't change once receipts exist.
    if (device?.hasIssuedReceipts) {
      this.deviceForm.get('serialNumber')?.disable();
    } else {
      this.deviceForm.get('serialNumber')?.enable();
    }
    this.showDeviceForm.set(true);
  }

  cancelDeviceForm(): void {
    this.showDeviceForm.set(false);
    this.editingDevice.set(null);
  }

  onSaveDevice(): void {
    const editing = this.editingDevice();
    if (!editing && !this.deviceForm.value.presharedKey) {
      this.deviceForm.get('presharedKey')?.setErrors({ required: true });
    }
    if (this.deviceForm.invalid) {
      this.deviceForm.markAllAsTouched();
      return;
    }
    this.savingDevice.set(true);
    const value = this.deviceForm.getRawValue();
    const request = { ...value, presharedKey: value.presharedKey || undefined };
    const call = editing
      ? this.etaSettingsService.updateDevice(editing.id, request)
      : this.etaSettingsService.createDevice(request);
    call.subscribe({
      next: (saved) => {
        this.devices.set(editing
          ? this.devices().map((d) => (d.id === saved.id ? saved : d))
          : [...this.devices(), saved]);
        this.savingDevice.set(false);
        this.cancelDeviceForm();
        this.errorHandler.showSuccess('SETTINGS.SAVE_SUCCESS');
      },
      error: (err) => {
        this.savingDevice.set(false);
        this.errorHandler.handleHttpError(err, 'SETTINGS.SAVE_ERROR');
      }
    });
  }

  testConnection(device: EtaPosDevice): void {
    this.testingDeviceId.set(device.id);
    this.etaSettingsService.testConnection(device.id).subscribe({
      next: () => {
        this.testingDeviceId.set(null);
        this.errorHandler.showSuccess('ETA.TEST_SUCCESS');
      },
      error: (err) => {
        this.testingDeviceId.set(null);
        this.errorHandler.handleHttpError(err, 'ETA.TEST_FAILED');
      }
    });
  }

  hasError(control: string, error: string): boolean {
    const c = this.form.get(control);
    return !!c && c.touched && c.hasError(error);
  }
}
