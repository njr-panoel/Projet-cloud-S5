export type StatutSignalement = 'NOUVEAU' | 'EN_COURS' | 'TERMINE' | 'ANNULE';

export type TypeTravaux =
  | 'NIDS_DE_POULE'
  | 'FISSURE'
  | 'AFFAISSEMENT'
  | 'INONDATION'
  | 'SIGNALISATION'
  | 'ECLAIRAGE'
  | 'AUTRE';

export interface UserLiteDto {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  role: 'VISITEUR' | 'MANAGER' | 'UTILISATEUR_MOBILE';
}

export interface SignalementDto {
  id: number;
  titre: string;
  description: string | null;
  typeTravaux: TypeTravaux;
  statut: StatutSignalement;
  latitude: number;
  longitude: number;
  adresse: string | null;
  photos: string | null;
  user: UserLiteDto;
  synced: boolean;
  firebaseId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateSignalementRequest {
  titre: string;
  description?: string | null;
  typeTravaux: TypeTravaux;
  statut?: StatutSignalement | null;
  latitude: number;
  longitude: number;
  adresse?: string | null;
  photos?: string | null;
  firebaseId?: string | null;
}

export interface UpdateSignalementRequest extends CreateSignalementRequest {}
