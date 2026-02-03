import api from './api';
import { config } from '../config';
import type { ApiResponse } from '../types';

export const syncService = {
  async syncFromFirebase(): Promise<void> {
    await api.post<ApiResponse<void>>(config.endpoints.sync.fromFirebase);
  },

  async syncToFirebase(): Promise<void> {
    await api.post<ApiResponse<void>>(config.endpoints.sync.toFirebase);
  },

  async getStats() {
    const response = await api.get<ApiResponse<Record<string, any>>>(config.endpoints.sync.stats);
    return response.data.data;
  },
};
