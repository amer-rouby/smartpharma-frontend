export interface User {
  id: number;
  pharmacyId: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'ADMIN' | 'PHARMACIST' | 'VIEWER' | 'MANAGER';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  pharmacyName: string;
  licenseNumber: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  fullName: string;
}
