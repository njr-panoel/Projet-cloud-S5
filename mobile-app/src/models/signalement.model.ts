export type Statut = 'nouveau' | 'en_cours' | 'termine' | 'annule';

export interface Signalement {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  description: string;
  photoUrl: string | null;
  statut: Statut;
  surface_m2: number | null;
  budget: number | null;
  entreprise: string | null;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export interface SignalementInput {
  latitude: number;
  longitude: number;
  description: string;
  statut: Statut;
  surface_m2: number | null;
  budget: number | null;
  entreprise: string | null;
  photo: any;
}

export interface QueuedSignalement extends SignalementInput {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}
