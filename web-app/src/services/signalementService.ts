import api from './api';
import { config } from '../config';
import type { 
  Signalement, 
  SignalementFormData, 
  PaginatedResponse, 
  SignalementFilters,
  GlobalStats 
} from '../types';

export const signalementService = {
  async getAll(
    page = 0, 
    size = 10, 
    filters?: SignalementFilters
  ): Promise<PaginatedResponse<Signalement>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await api.get<PaginatedResponse<Signalement>>(
      `${config.endpoints.signalements.base}?${params.toString()}`
    );
    return response.data;
  },

  async getById(id: string): Promise<Signalement> {
    const response = await api.get<Signalement>(config.endpoints.signalements.byId(id));
    return response.data;
  },

  async getMine(): Promise<Signalement[]> {
    const response = await api.get<Signalement[]>(config.endpoints.signalements.mine);
    return response.data;
  },

  async create(data: SignalementFormData): Promise<Signalement> {
    const formData = new FormData();
    formData.append('titre', data.titre);
    formData.append('description', data.description);
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    formData.append('typeTravaux', data.typeTravaux);
    
    if (data.adresse) formData.append('adresse', data.adresse);
    if (data.priorite) formData.append('priorite', data.priorite);
    
    if (data.photos) {
      data.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response = await api.post<Signalement>(
      config.endpoints.signalements.base, 
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async update(id: string, data: Partial<Signalement>): Promise<Signalement> {
    const response = await api.patch<Signalement>(
      config.endpoints.signalements.byId(id), 
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(config.endpoints.signalements.byId(id));
  },

  async getStats(): Promise<GlobalStats> {
    const response = await api.get<GlobalStats>(config.endpoints.signalements.stats);
    return response.data;
  },
};
