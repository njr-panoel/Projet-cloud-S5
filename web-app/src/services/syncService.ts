import api from './api';
import { config } from '../config';
import type { ApiResponse } from '../types';

export interface SyncStats {
  totalSignalements: number;
  syncedSignalements: number;
  unsyncedSignalements: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalUsers: number;
  firebaseEnabled: boolean;
}

export interface SyncResult {
  message: string;
  syncedCount: number;
}

export const syncService = {
  // Récupérer les signalements depuis Firebase vers PostgreSQL
  async syncFromFirebase(): Promise<void> {
    const response = await api.post<ApiResponse<void>>(config.endpoints.sync.fromFirebase);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur de synchronisation');
    }
  },

  // Envoyer les signalements non synchronisés vers Firebase
  async syncToFirebase(): Promise<SyncResult> {
    const response = await api.post<ApiResponse<SyncResult>>(config.endpoints.sync.toFirebase);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur de synchronisation');
    }
    return response.data.data!;
  },

  // Forcer la synchronisation de TOUS les signalements vers Firebase
  async forceSyncToFirebase(): Promise<SyncResult> {
    const response = await api.post<ApiResponse<SyncResult>>(`${config.endpoints.sync.base}/force-to-firebase`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur de synchronisation forcée');
    }
    return response.data.data!;
  },

  // Envoyer les comptes utilisateurs mobiles vers Firebase
  async syncUsersToFirebase(): Promise<void> {
    const response = await api.post<ApiResponse<void>>(config.endpoints.sync.usersToFirebase);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur de synchronisation des utilisateurs');
    }
  },

  // Synchronisation complète (signalements + utilisateurs)
  async fullSync(): Promise<void> {
    const response = await api.post<ApiResponse<void>>(config.endpoints.sync.full);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur de synchronisation complète');
    }
  },

  // Obtenir les statistiques de synchronisation
  async getStats(): Promise<SyncStats> {
    const response = await api.get<ApiResponse<SyncStats>>(config.endpoints.sync.stats);
    return response.data.data;
  },
};
