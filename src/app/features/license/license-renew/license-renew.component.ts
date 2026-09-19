import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../shared/material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AuthService } from '../../../core/services/auth.service';
import { LicenseService } from '../../../core/services/license.service';

@Component({
  selector: 'app-license-renew',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, TranslateModule, PageHeaderComponent],
  templateUrl: './license-renew.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './license-renew.component.scss'
})
export class LicenseRenewComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly licenseService = inject(LicenseService);
  private readonly errorHandler = inject(ErrorHandlerService);

  // Only an ADMIN can actually submit a code (matches the backend's
  // @PreAuthorize on POST /api/license/renew) - a pharmacist/staff account
  // just sees a message telling them to contact the pharmacy admin.
  readonly isAdmin = computed(() => this.authService.getCurrentUser()?.role === 'ADMIN');
  readonly pharmacyId = computed(() => this.authService.getPharmacyId());
  readonly code = signal('');
  readonly submitting = signal(false);
  readonly expiresAt = signal<string | null>(null);
  // Reachable two ways: forced here by licenseGuard (expired) or opened
  // voluntarily from Settings to check status/renew early - the messaging
  // differs, but the code-entry form works the same either way.
  readonly expired = signal(false);

  // The header must never say "you must renew" to a fresh install or a
  // healthy subscription - that read as broken/alarming to a technician or
  // customer opening this screen for the first time with nothing wrong.
  readonly pageTitleKey = computed(() => this.expired() ? 'LICENSE.TITLE_EXPIRED' : 'LICENSE.TITLE_OK');
  readonly pageSubtitleKey = computed(() => this.expired() ? 'LICENSE.SUBTITLE_EXPIRED' : 'LICENSE.SUBTITLE_OK');

  ngOnInit(): void {
    this.refreshStatus();
  }

  onSubmit(): void {
    const value = this.code().trim();
    if (!value) return;

    this.submitting.set(true);
    this.licenseService.renew(value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.code.set('');
        this.errorHandler.showSuccess('LICENSE.RENEW_SUCCESS');
        this.refreshStatus();
      },
      error: (err) => {
        this.submitting.set(false);
        if (!this.errorHandler.showByCode(err?.error?.code, err?.error?.params)) {
          this.errorHandler.showError('LICENSE.RENEW_ERROR');
        }
      }
    });
  }

  private refreshStatus(): void {
    this.licenseService.fetchStatus().subscribe((status) => {
      this.expiresAt.set(status.expiresAt);
      this.expired.set(status.expired);
    });
  }
}
