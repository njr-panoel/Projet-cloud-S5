export interface Signalement {
  id?: string;
  userId: string;
  latitude: number;
  longitude: number;
  description: string;
  photoUrl?: string | null;
  statut: 'nouveau' | 'en_cours' | 'termine';
  surface_m2?: number | null;
  budget?: number | null;
  entreprise?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export interface User {
  uid: string;
  email: string;
}