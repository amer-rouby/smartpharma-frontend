export interface PharmacySettings {
  id: number;
  pharmacyId: number;
  pharmacyName: string;
  address?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  taxNumber?: string;
  commercialRegister?: string;
  logoUrl?: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  enabledPaymentMethods?: string;
  largeSaleThreshold?: number;
  largeExpenseThreshold?: number;
  requirePrescriptionUpload?: boolean;
  updatedAt?: string;
}

export interface PharmacySettingsRequest {
  pharmacyName: string;
  address?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  taxNumber?: string;
  commercialRegister?: string;
  logoUrl?: string;
  currency?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  enabledPaymentMethods?: string;
  largeSaleThreshold?: number;
  largeExpenseThreshold?: number;
  requirePrescriptionUpload?: boolean;
}
