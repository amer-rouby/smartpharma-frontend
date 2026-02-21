export interface AuthResponse {
  userId: number;
  pharmacyId: number;
  username: string;
  fullName: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  message: string;
}
