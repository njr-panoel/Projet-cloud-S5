import api from './api';
import { config } from '../config';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';
import axios from 'axios';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(config.endpoints.auth.login, data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur de connexion');
      }
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const apiError = error.response.data as ApiResponse<unknown>;
        throw new Error(apiError.message || 'Erreur de connexion');
      }
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(config.endpoints.auth.register, data);
      if (!response.data.success) {
        throw new Error(response.data.message || "Erreur d'inscription");
      }
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const apiError = error.response.data as ApiResponse<unknown>;
        throw new Error(apiError.message || "Erreur d'inscription");
      }
      throw error;
    }
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
