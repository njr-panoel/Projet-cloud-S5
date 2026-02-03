export type UserRole = 'VISITEUR' | 'MANAGER' | 'UTILISATEUR_MOBILE';
export type AuthProvider = 'LOCAL' | 'FIREBASE';

export interface UserDto {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  role: UserRole;
  authProvider: AuthProvider;
  active: boolean;
  accountLocked: boolean;
  lockedUntil: string | null;
  loginAttempts: number;
  createdAt: string;
  lastLoginAt: string | null;
}
