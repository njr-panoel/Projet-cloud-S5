import api from './api';
import { config } from '../config';
import type { User, ApiResponse, UserRole, CreateManagerRequest, RegisterRequest, AuthResponse } from '../types';

export const userService = {
  // Récupérer tous les utilisateurs (Manager uniquement)
  async getAll(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>(config.endpoints.users.base);
    return response.data.data || [];
  },

  // Récupérer un utilisateur par ID
  async getById(id: number): Promise<User> {
    const response = await api.get<ApiResponse<User>>(config.endpoints.users.byId(id));
    if (!response.data.success) {
      throw new Error(response.data.message || 'Utilisateur non trouvé');
    }
    return response.data.data;
  },

  // Récupérer les utilisateurs par rôle (Manager uniquement)
  async getByRole(role: UserRole): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>(config.endpoints.users.byRole(role));
    return response.data.data || [];
  },

  // Récupérer les comptes verrouillés (Manager uniquement)
  async getLocked(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>(config.endpoints.users.locked);
    return response.data.data || [];
  },

  // Débloquer un utilisateur (Manager uniquement)
  async unlockUser(id: number): Promise<User> {
    const response = await api.post<ApiResponse<User>>(config.endpoints.users.unlock(id));
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors du déblocage');
    }
    return response.data.data;
  },

  // Mettre à jour le rôle d'un utilisateur (Manager uniquement)
  async updateRole(id: number, role: UserRole): Promise<User> {
    const response = await api.put<ApiResponse<User>>(
      `${config.endpoints.users.updateRole(id)}?role=${role}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la mise à jour du rôle');
    }
    return response.data.data;
  },

  // Supprimer un utilisateur (Manager uniquement)
  async deleteUser(id: number): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(config.endpoints.users.byId(id));
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la suppression');
    }
  },

  // Créer un nouveau manager (Manager uniquement)
  async createManager(data: CreateManagerRequest): Promise<User> {
    const response = await api.post<ApiResponse<User>>(config.endpoints.users.createManager, data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la création du manager');
    }
    return response.data.data;
  },

  // Créer un nouvel utilisateur (Manager uniquement)
  async createUser(data: RegisterRequest): Promise<User> {
    const response = await api.post<ApiResponse<AuthResponse>>(config.endpoints.auth.register, data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la création');
    }
    return response.data.data.user;
  },
};
