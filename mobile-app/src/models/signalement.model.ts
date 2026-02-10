export type Statut = 'nouveau' | 'en_cours' | 'termine';

export type TypeProbleme = 
  | 'nids_de_poule' 
  | 'fissure' 
  | 'affaissement' 
  | 'inondation' 
  | 'obstacle' 
  | 'autre';

export const TYPE_PROBLEME_LABELS: Record<TypeProbleme, string> = {
  nids_de_poule: 'Nids de poule',
  fissure: 'Fissure',
  affaissement: 'Affaissement',
  inondation: 'Inondation',
  obstacle: 'Obstacle sur la route',
  autre: 'Autre'
};

export interface Signalement {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  description: string;
  type: TypeProbleme;
  photoUrl: string | null;
  photoBase64: string | null;
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
  type: TypeProbleme;
  photoBase64?: string;
}

export interface QueuedSignalement extends SignalementInput {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}
