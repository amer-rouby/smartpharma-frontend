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

  // Only ADMIN can submit a code, matching the backend's @PreAuthorize.
  readonly isAdmin = computed(() => this.authService.getCurrentUser()?.role === 'ADMIN');
  readonly pharmacyId = computed(() => this.authService.getPharmacyId());
  readonly code = signal('');
  readonly submitting = signal(false);
  readonly expiresAt = signal<string | null>(null);
  // Reachable via licenseGuard (expired) or voluntarily from Settings.
  readonly expired = signal(false);

  // Never show "you must renew" for a fresh install or healthy subscription.
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
