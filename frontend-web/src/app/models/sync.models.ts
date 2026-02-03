export interface SyncStatsDto {
  totalSignalements: number;
  syncedSignalements: number;
  unsyncedSignalements: number;
  successfulSyncs: number;
  failedSyncs: number;
  firebaseEnabled: boolean;
}

export interface SyncLogDto {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  firebaseId: string | null;
  success: boolean;
  errorMessage: string | null;
  syncedAt: string;
}
