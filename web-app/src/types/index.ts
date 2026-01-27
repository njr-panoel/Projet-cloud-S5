// User types - correspond aux rôles backend
export type UserRole = 'VISITEUR' | 'MANAGER' | 'UTILISATEUR_MOBILE';
export type AuthProvider = 'LOCAL' | 'FIREBASE';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: UserRole;
  authProvider: AuthProvider;
  active: boolean;
  accountLocked: boolean;
  lockedUntil?: string;
  loginAttempts?: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
  expiresIn: number;
}

// Signalement types - correspond aux enums backend
export type SignalementStatut = 'NOUVEAU' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
export type TypeTravaux = 'NIDS_DE_POULE' | 'FISSURE' | 'AFFAISSEMENT' | 'INONDATION' | 'SIGNALISATION' | 'ECLAIRAGE' | 'AUTRE';

export interface Signalement {
  id: number;
  titre: string;
  description?: string;
  typeTravaux: TypeTravaux;
  statut: SignalementStatut;
  latitude: number;
  longitude: number;
  adresse?: string;
  photos?: string; // URLs séparées par virgules
  surfaceM2?: number; // Surface en m²
  budget?: number;   // Budget en Ariary
  entreprise?: string; // Entreprise concernée
  user: User;
  synced: boolean;
  firebaseId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface SignalementFormData {
  titre: string;
  description?: string;
  typeTravaux: TypeTravaux;
  statut?: SignalementStatut;
  latitude: number;
  longitude: number;
  adresse?: string;
  photos?: string;
  surfaceM2?: number;
  budget?: number;
  entreprise?: string;
  firebaseId?: string;
}

// Stats types - calculées côté frontend à partir de la liste
export interface GlobalStats {
  totalSignalements: number;
  nouveau: number;
  enCours: number;
  termines: number;
  annules: number;
  pourcentageTermine: number;
  totalSurface: number;  // Total surface en m²
  totalBudget: number;   // Total budget en Ariary
}

// API types - correspond à ApiResponse du backend
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
  useFirebase?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role?: UserRole;
}

// Filter types
export interface SignalementFilters {
  statut?: SignalementStatut | '';
  typeTravaux?: TypeTravaux | '';
  search?: string;
}
