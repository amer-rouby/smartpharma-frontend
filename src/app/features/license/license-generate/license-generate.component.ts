import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../shared/material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LicenseService } from '../../../core/services/license.service';
import { GeneratedLicenseCode } from '../../../core/models/license.model';

// Vendor-only screen: only works against this branch's own backend, which is
// the sole place license.private-key-path is ever configured (see
// LicenseServiceImpl.generateCode) - never reachable on a customer's copy.
@Component({
  selector: 'app-license-generate',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, TranslateModule, PageHeaderComponent],
  templateUrl: './license-generate.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './license-generate.component.scss'
})
export class LicenseGenerateComponent {
  private readonly licenseService = inject(LicenseService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly pharmacyId = signal<number | null>(null);
  // A one-time-purchase product has no real renewal cadence, so this
  // defaults to effectively permanent (100 years) rather than a monthly
  // duration - override it for an actual subscription-style customer.
  readonly months = signal(1200);
  readonly submitting = signal(false);
  readonly result = signal<GeneratedLicenseCode | null>(null);
  readonly copied = signal(false);

  onSubmit(): void {
    const id = this.pharmacyId();
    if (!id || this.months() < 1) return;

    this.submitting.set(true);
    this.result.set(null);
    this.licenseService.generateCode(id, this.months()).subscribe({
      next: (generated) => {
        this.submitting.set(false);
        this.result.set(generated);
      },
      error: (err) => {
        this.submitting.set(false);
        if (!this.errorHandler.showByCode(err?.error?.code, err?.error?.params)) {
          this.errorHandler.showError('LICENSE.GENERATE_ERROR');
        }
      }
    });
  }

  copyCode(): void {
    const code = this.result()?.code;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  reset(): void {
    this.pharmacyId.set(null);
    this.result.set(null);
  }
}
