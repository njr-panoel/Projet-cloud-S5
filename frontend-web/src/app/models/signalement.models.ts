export interface SignalementDto {
  id: number;
  userId: number;
  nomUtilisateur: string;
  latitude: number;
  longitude: number;
  description: string;
  photoUrl: string | null;
  statut: string;
  surfaceM2: number | null;
  budget: number | null;
  entreprise: string | null;
  dateCreation: string;
  dateUpdate: string;
}

export interface CreateSignalementRequest {
  latitude: number;
  longitude: number;
  description: string;
  photoUrl?: string | null;
}

export interface UpdateSignalementRequest {
  statut?: string | null;
  surfaceM2?: number | null;
  budget?: number | null;
  entreprise?: string | null;
}
