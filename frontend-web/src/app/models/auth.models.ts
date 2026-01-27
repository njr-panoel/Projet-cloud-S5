export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: string;
  useFirebase?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  role?: 'VISITEUR' | 'MANAGER' | 'UTILISATEUR_MOBILE';
  firebaseUid?: string | null;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: UserResponse;
  expiresIn: number;
}

export interface UserProfileDto {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  role: 'VISITEUR' | 'MANAGER' | 'UTILISATEUR_MOBILE';
  authProvider: 'LOCAL' | 'FIREBASE';
  active: boolean;
  accountLocked: boolean;
  lockedUntil: string | null;
  loginAttempts: number;
  createdAt: string;
  lastLoginAt: string | null;
}

export type UserResponse = UserProfileDto;
