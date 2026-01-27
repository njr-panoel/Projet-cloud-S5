// User types
export type UserRole = 'VISITEUR' | 'UTILISATEUR' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  telephone?: string;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Signalement types
export type SignalementStatut = 'SIGNALE' | 'EN_COURS' | 'TERMINE' | 'REJETE';
export type SignalementPriorite = 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';
export type TypeTravaux = 'ROUTE' | 'TROTTOIR' | 'ECLAIRAGE' | 'ASSAINISSEMENT' | 'AUTRE';

export interface Signalement {
  id: string;
  titre: string;
  description: string;
  latitude: number;
  longitude: number;
  adresse?: string;
  statut: SignalementStatut;
  priorite: SignalementPriorite;
  typeTravaux: TypeTravaux;
  photos: string[];
  surface?: number;
  budget?: number;
  entreprise?: string;
  dateDebut?: string;
  dateFin?: string;
  userId: string;
  userNom?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignalementFormData {
  titre: string;
  description: string;
  latitude: number;
  longitude: number;
  adresse?: string;
  typeTravaux: TypeTravaux;
  priorite?: SignalementPriorite;
  photos?: File[];
}

// Stats types
export interface GlobalStats {
  totalSignalements: number;
  enCours: number;
  termines: number;
  surfaceTotale: number;
  budgetTotal: number;
  pourcentageTermine: number;
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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

export interface AuthResponse {
  token: string;
  user: User;
}

// Filter types
export interface SignalementFilters {
  statut?: SignalementStatut | '';
  typeTravaux?: TypeTravaux | '';
  entreprise?: string;
  dateDebut?: string;
  dateFin?: string;
  search?: string;
}
