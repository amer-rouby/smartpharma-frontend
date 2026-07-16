export interface AuthResponse {
  userId: number;
  username: string;
  fullName: string;
  role: string;
  pharmacyId: number;
  pharmacyName: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string; // "Bearer"
  expiresIn: number;  // timestamp
  expiresAt: string;  // ISO datetime
  sessionTimeout: number; // minutes
  warningThreshold?: number; // minutes before warning
  maxExtensions?: number; // max allowed extensions
  remainingExtensions?: number; // remaining extensions
  canExtend?: boolean; // true if can extend
  message?: string;
}
