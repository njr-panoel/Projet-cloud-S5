export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  nom: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfileDto {
  id: number;
  nom: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
