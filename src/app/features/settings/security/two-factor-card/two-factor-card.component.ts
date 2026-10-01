import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toDataURL } from 'qrcode';
import { MaterialModule } from '../../../../shared/material.module';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { SecuritySettingsService, TwoFactorSetup } from '../../../../core/services/settings/security-settings.service';

// Turns two-factor sign-in on or off for the signed-in user. Turning it on
// shows a QR code (rendered locally - the secret never goes to a QR service)
// and is only confirmed once a code from the app checks out.
@Component({
  selector: 'app-two-factor-card',
  standalone: true,
  imports: [MaterialModule, FormsModule],
  templateUrl: './two-factor-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './two-factor-card.component.scss'
})
export class TwoFactorCardComponent implements OnInit {
  private readonly securitySettingsService = inject(SecuritySettingsService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly enabled = signal<boolean | null>(null);
  readonly setup = signal<TwoFactorSetup | null>(null);
  readonly qrImage = signal<string | null>(null);
  readonly disabling = signal(false);
  readonly busy = signal(false);
  readonly code = signal('');

  ngOnInit(): void {
    this.securitySettingsService.getSettings().subscribe({
      next: (settings) => this.enabled.set(!!settings?.twoFactorEnabled),
      error: () => this.enabled.set(false)
    });
  }

  startSetup(): void {
    this.busy.set(true);
    this.securitySettingsService.setupTwoFactor().subscribe({
      next: (setup) => {
        this.busy.set(false);
        this.setup.set(setup);
        this.code.set('');
        toDataURL(setup.otpAuthUrl, { errorCorrectionLevel: 'M', margin: 1, width: 200 })
          .then((url) => this.qrImage.set(url))
          .catch(() => this.qrImage.set(null));
      },
      error: (err) => {
        this.busy.set(false);
        this.errorHandler.handleHttpError(err, 'SECURITY.TWO_FACTOR.SETUP_ERROR');
      }
    });
  }

  confirmSetup(): void {
    if (!this.validCode()) return;
    this.busy.set(true);
    this.securitySettingsService.verifyTwoFactor(this.code()).subscribe({
      next: () => {
        this.busy.set(false);
        this.enabled.set(true);
        this.cancel();
        this.errorHandler.showSuccess('SECURITY.TWO_FACTOR.ENABLED_SUCCESS');
      },
      error: (err) => {
        this.busy.set(false);
        this.errorHandler.handleHttpError(err, 'SECURITY.TWO_FACTOR.VERIFY_ERROR');
      }
    });
  }

  confirmDisable(): void {
    if (!this.validCode()) return;
    this.busy.set(true);
    this.securitySettingsService.disableTwoFactor(this.code()).subscribe({
      next: () => {
        this.busy.set(false);
        this.enabled.set(false);
        this.cancel();
        this.errorHandler.showSuccess('SECURITY.TWO_FACTOR.DISABLED_SUCCESS');
      },
      error: (err) => {
        this.busy.set(false);
        this.errorHandler.handleHttpError(err, 'SECURITY.TWO_FACTOR.VERIFY_ERROR');
      }
    });
  }

  startDisable(): void {
    this.disabling.set(true);
    this.code.set('');
  }

  cancel(): void {
    this.setup.set(null);
    this.qrImage.set(null);
    this.disabling.set(false);
    this.code.set('');
  }

  setCode(value: string): void {
    this.code.set((value ?? '').replace(/\D/g, '').slice(0, 6));
  }

  validCode(): boolean {
    return /^\d{6}$/.test(this.code());
  }
}
