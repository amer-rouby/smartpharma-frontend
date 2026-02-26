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

export enum UserRole {
  ADMIN = 'ADMIN',
  PHARMACIST = 'PHARMACIST',
  VIEWER = 'VIEWER',
  MANAGER = 'MANAGER'
}

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
export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  pharmacyId: number;
  pharmacyName?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserRequest {
  username: string;
  password?: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  pharmacyId: number;
  isActive?: boolean;
}

export interface UsersCountResponse {
  count: number;
}
