import api from './api';
import { config } from '../config';
import type { 
  Signalement, 
  SignalementFormData, 
  SignalementFilters,
  GlobalStats,
  ApiResponse,
  SignalementStatut
} from '../types';

export const signalementService = {
  // Récupérer tous les signalements (public)
  async getAll(): Promise<Signalement[]> {
    const response = await api.get<ApiResponse<Signalement[]>>(config.endpoints.signalements.base);
    return response.data.data || [];
  },

  // Récupérer un signalement par ID (public)
  async getById(id: number): Promise<Signalement> {
    const response = await api.get<ApiResponse<Signalement>>(config.endpoints.signalements.byId(id));
    if (!response.data.success) {
      throw new Error(response.data.message || 'Signalement non trouvé');
    }
    return response.data.data;
  },

  // Récupérer par statut
  async getByStatut(statut: string): Promise<Signalement[]> {
    const response = await api.get<ApiResponse<Signalement[]>>(config.endpoints.signalements.byStatut(statut));
    return response.data.data || [];
  },

  // Récupérer par type
  async getByType(type: string): Promise<Signalement[]> {
    const response = await api.get<ApiResponse<Signalement[]>>(config.endpoints.signalements.byType(type));
    return response.data.data || [];
  },

  // Créer un signalement (authentifié)
  async create(data: SignalementFormData): Promise<Signalement> {
    const response = await api.post<ApiResponse<Signalement>>(
      config.endpoints.signalements.base, 
      data
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la création');
    }
    return response.data.data;
  },

  // Mettre à jour un signalement (Manager ou UTILISATEUR_MOBILE)
  async update(id: number, data: SignalementFormData): Promise<Signalement> {
    const response = await api.put<ApiResponse<Signalement>>(
      config.endpoints.signalements.byId(id), 
      data
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la mise à jour');
    }
    return response.data.data;
  },

  // Mettre à jour le statut (Manager uniquement)
  async updateStatut(id: number, statut: SignalementStatut): Promise<Signalement> {
    const response = await api.patch<ApiResponse<Signalement>>(
      `${config.endpoints.signalements.updateStatut(id)}?statut=${statut}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la mise à jour du statut');
    }
    return response.data.data;
  },

  // Supprimer un signalement (Manager uniquement)
  async delete(id: number): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(config.endpoints.signalements.byId(id));
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la suppression');
    }
  },

  // Calculer les statistiques à partir de la liste
  calculateStats(signalements: Signalement[]): GlobalStats {
    const total = signalements.length;
    const nouveau = signalements.filter(s => s.statut === 'NOUVEAU').length;
    const enCours = signalements.filter(s => s.statut === 'EN_COURS').length;
    const termines = signalements.filter(s => s.statut === 'TERMINE').length;
    const annules = signalements.filter(s => s.statut === 'ANNULE').length;
    
    return {
      totalSignalements: total,
      nouveau,
      enCours,
      termines,
      annules,
      pourcentageTermine: total > 0 ? Math.round((termines / total) * 100) : 0,
    };
  },

  // Filtrer les signalements côté client
  filterSignalements(signalements: Signalement[], filters: SignalementFilters): Signalement[] {
    return signalements.filter(s => {
      if (filters.statut && s.statut !== filters.statut) return false;
      if (filters.typeTravaux && s.typeTravaux !== filters.typeTravaux) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchTitre = s.titre.toLowerCase().includes(searchLower);
        const matchDescription = s.description?.toLowerCase().includes(searchLower);
        const matchAdresse = s.adresse?.toLowerCase().includes(searchLower);
        if (!matchTitre && !matchDescription && !matchAdresse) return false;
      }
      return true;
    });
  },
};
