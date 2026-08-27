export interface SmartFeatureSettings {
  id: number;
  pharmacyId: number;
  stockPredictionEnabled: boolean;
  reorderRecommendationsEnabled: boolean;
  pricingRecommendationsEnabled: boolean;
  supplierRecommendationsEnabled: boolean;
  dashboardInsightsEnabled: boolean;
  dailyBriefEnabled: boolean;
  anomalyDetectionEnabled: boolean;
  realtimeUpdatesEnabled: boolean;
  voiceSearchEnabled: boolean;
  aiAssistantEnabled: boolean;
  eInvoiceEnabled: boolean;
  offlineModeEnabled: boolean;
  updatedAt?: string;
}

export type SmartFeatureSettingsRequest = Partial<Omit<SmartFeatureSettings, 'id' | 'pharmacyId' | 'updatedAt'>>;
