export interface LicenseStatus {
  expired: boolean;
  // Null when the pharmacy has never been licensed yet (unlimited/not activated).
  expiresAt: string | null;
}

export interface GeneratedLicenseCode {
  code: string;
  pharmacyId: number;
  expiresAt: string;
}
