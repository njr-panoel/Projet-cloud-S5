import api from './api';
import { config } from '../config';
import type { User, PaginatedResponse } from '../types';

export const userService = {
  async getAll(page = 0, size = 10): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>(
      `${config.endpoints.users.base}?page=${page}&size=${size}`
    );
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(config.endpoints.users.byId(id));
    return response.data;
  },

  async getBlocked(page = 0, size = 10): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>(
      `${config.endpoints.users.blocked}?page=${page}&size=${size}`
    );
    return response.data;
  },

  async blockUser(id: string): Promise<User> {
    const response = await api.post<User>(config.endpoints.users.block(id));
    return response.data;
  },

  async unblockUser(id: string): Promise<User> {
    const response = await api.post<User>(config.endpoints.users.unblock(id));
    return response.data;
  },
};
