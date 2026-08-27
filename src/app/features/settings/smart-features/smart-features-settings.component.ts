import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SmartFeatureSettingsService } from '../../../core/services/settings/smart-feature-settings.service';
import { SmartFeatureSettings, SmartFeatureSettingsRequest } from '../../../core/models/settings/smart-feature-settings.model';

interface FeatureToggle {
  key: keyof SmartFeatureSettingsRequest;
  icon: string;
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-smart-features-settings',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, FormsModule],
  templateUrl: './smart-features-settings.component.html',
  styleUrl: './smart-features-settings.component.scss'
})
export class SmartFeaturesSettingsComponent implements OnInit {
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly smartFeatureSettingsService = inject(SmartFeatureSettingsService);

  readonly loading = signal(false);
  readonly saving = signal(false);

  toggles: FeatureToggle[] = [];

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);

    this.smartFeatureSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.toggles = this.buildToggles(settings);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorHandler.handleHttpError(err, 'SMART_FEATURES.LOAD_ERROR');
      }
    });
  }

  private buildToggles(settings: SmartFeatureSettings): FeatureToggle[] {
    return [
      {
        key: 'stockPredictionEnabled', icon: 'psychology',
        label: 'SMART_FEATURES.STOCK_PREDICTION', description: 'SMART_FEATURES.DESC.STOCK_PREDICTION',
        enabled: settings.stockPredictionEnabled
      },
      {
        key: 'reorderRecommendationsEnabled', icon: 'add_shopping_cart',
        label: 'SMART_FEATURES.REORDER_RECOMMENDATIONS', description: 'SMART_FEATURES.DESC.REORDER_RECOMMENDATIONS',
        enabled: settings.reorderRecommendationsEnabled
      },
      {
        key: 'pricingRecommendationsEnabled', icon: 'sell',
        label: 'SMART_FEATURES.PRICING_RECOMMENDATIONS', description: 'SMART_FEATURES.DESC.PRICING_RECOMMENDATIONS',
        enabled: settings.pricingRecommendationsEnabled
      },
      {
        key: 'supplierRecommendationsEnabled', icon: 'local_shipping',
        label: 'SMART_FEATURES.SUPPLIER_RECOMMENDATIONS', description: 'SMART_FEATURES.DESC.SUPPLIER_RECOMMENDATIONS',
        enabled: settings.supplierRecommendationsEnabled
      },
      {
        key: 'dashboardInsightsEnabled', icon: 'insights',
        label: 'SMART_FEATURES.DASHBOARD_INSIGHTS', description: 'SMART_FEATURES.DESC.DASHBOARD_INSIGHTS',
        enabled: settings.dashboardInsightsEnabled
      },
      {
        key: 'dailyBriefEnabled', icon: 'today',
        label: 'SMART_FEATURES.DAILY_BRIEF', description: 'SMART_FEATURES.DESC.DAILY_BRIEF',
        enabled: settings.dailyBriefEnabled
      },
      {
        key: 'anomalyDetectionEnabled', icon: 'gpp_maybe',
        label: 'SMART_FEATURES.ANOMALY_DETECTION', description: 'SMART_FEATURES.DESC.ANOMALY_DETECTION',
        enabled: settings.anomalyDetectionEnabled
      },
      {
        key: 'realtimeUpdatesEnabled', icon: 'bolt',
        label: 'SMART_FEATURES.REALTIME_UPDATES', description: 'SMART_FEATURES.DESC.REALTIME_UPDATES',
        enabled: settings.realtimeUpdatesEnabled
      },
      {
        key: 'voiceSearchEnabled', icon: 'mic',
        label: 'SMART_FEATURES.VOICE_SEARCH', description: 'SMART_FEATURES.DESC.VOICE_SEARCH',
        enabled: settings.voiceSearchEnabled
      },
      {
        key: 'aiAssistantEnabled', icon: 'smart_toy',
        label: 'SMART_FEATURES.AI_ASSISTANT', description: 'SMART_FEATURES.DESC.AI_ASSISTANT',
        enabled: settings.aiAssistantEnabled
      },
      {
        key: 'eInvoiceEnabled', icon: 'receipt_long',
        label: 'SMART_FEATURES.E_INVOICE', description: 'SMART_FEATURES.DESC.E_INVOICE',
        enabled: settings.eInvoiceEnabled
      },
      {
        key: 'offlineModeEnabled', icon: 'wifi_off',
        label: 'SMART_FEATURES.OFFLINE_MODE', description: 'SMART_FEATURES.DESC.OFFLINE_MODE',
        enabled: settings.offlineModeEnabled
      }
    ];
  }

  onSave(): void {
    this.saving.set(true);

    const request: SmartFeatureSettingsRequest = this.toggles.reduce((acc, toggle) => {
      (acc as any)[toggle.key] = toggle.enabled;
      return acc;
    }, {} as SmartFeatureSettingsRequest);

    this.smartFeatureSettingsService.updateSettings(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.errorHandler.showSuccess('SETTINGS.SAVE_SUCCESS');
      },
      error: (err) => {
        this.saving.set(false);
        this.errorHandler.handleHttpError(err, 'SETTINGS.SAVE_ERROR');
      }
    });
  }

  onReset(): void {
    this.loadSettings();
    this.errorHandler.showSuccess('COMMON.RESET');
  }
}
