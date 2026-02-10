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
  mobileUsers: number;
  mobileUsersWithFirebaseAuth: number;
  firebaseEnabled: boolean;
}

export interface SyncResult {
  message: string;
  syncedCount: number;
}

export interface BidirectionalSyncResult {
  success: boolean;
  syncedAt: string;
  users: {
    syncedCount: number;
    syncedEmails: string[];
  };
  signalementsToFirebase: number;
  signalementsFromFirebase: {
    created: number;
    updated: number;
    errors: number;
    total: number;
  };
}

export const syncService = {
  // Synchronisation bidirectionnelle complète (PostgreSQL ↔ Firebase)
  async bidirectionalSync(): Promise<BidirectionalSyncResult> {
    const response = await api.post<ApiResponse<BidirectionalSyncResult>>(config.endpoints.sync.bidirectional);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur de synchronisation bidirectionnelle');
    }
    return response.data.data!;
  },

  // Récupérer les signalements depuis Firebase vers PostgreSQL
  async syncFromFirebase(): Promise<{ created: number; updated: number; errors: number }> {
    const response = await api.post<ApiResponse<{ created: number; updated: number; errors: number }>>(config.endpoints.sync.fromFirebase);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur de synchronisation');
    }
    return response.data.data!;
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

  // Envoyer les comptes utilisateurs mobiles vers Firebase Auth
  async syncUsersToFirebase(): Promise<{ syncedCount: number; syncedEmails: string[]; metadataSynced: boolean }> {
    const response = await api.post<ApiResponse<{ syncedCount: number; syncedEmails: string[]; metadataSynced: boolean }>>(config.endpoints.sync.usersToFirebase);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur de synchronisation des utilisateurs');
    }
    return response.data.data!;
  },

  // Synchronisation complète (alias pour bidirectionnelle)
  async fullSync(): Promise<BidirectionalSyncResult> {
    const response = await api.post<ApiResponse<BidirectionalSyncResult>>(config.endpoints.sync.full);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur de synchronisation complète');
    }
    return response.data.data!;
  },

  // Obtenir les statistiques de synchronisation
  async getStats(): Promise<SyncStats> {
    const response = await api.get<ApiResponse<SyncStats>>(config.endpoints.sync.stats);
    return response.data.data;
  },
};
