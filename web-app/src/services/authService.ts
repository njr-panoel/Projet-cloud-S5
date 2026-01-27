import api from './api';
import { config } from '../config';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(config.endpoints.auth.login, data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(config.endpoints.auth.register, data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>(config.endpoints.auth.me);
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>(config.endpoints.auth.profile, data);
    return response.data;
  },
};
