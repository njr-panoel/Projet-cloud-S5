import api from './api';
import { config } from '../config';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(config.endpoints.auth.login, data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur de connexion');
    }
    return response.data.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(config.endpoints.auth.register, data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur d'inscription");
    }
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post<ApiResponse<void>>(config.endpoints.auth.logout);
  },

  async checkAuth(): Promise<string | null> {
    try {
      const response = await api.get<ApiResponse<string>>(config.endpoints.auth.me);
      if (response.data.success) {
        return response.data.data; // Returns email of authenticated user
      }
      return null;
    } catch {
      return null;
    }
  },
};
