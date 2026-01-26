import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { Page } from '../../models/page.models';
import {
  CreateSignalementRequest,
  SignalementDto,
  UpdateSignalementRequest
} from '../../models/signalement.models';

@Injectable({ providedIn: 'root' })
export class SignalementsService {
  private readonly api = inject(ApiService);

  list(params?: {
    statut?: string;
    dateMin?: string;
    dateMax?: string;
    entreprise?: string;
    page?: number;
    size?: number;
  }) {
    return this.api.get<Page<SignalementDto>>('/signalements', params);
  }

  getById(id: number) {
    return this.api.get<SignalementDto>(`/signalements/${id}`);
  }

  create(payload: CreateSignalementRequest) {
    return this.api.post<SignalementDto>('/signalements', payload);
  }

  update(id: number, payload: UpdateSignalementRequest) {
    return this.api.patch<SignalementDto>(`/signalements/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<void>(`/signalements/${id}`);
  }

  myReports(params?: { page?: number; size?: number }) {
    return this.api.get<Page<SignalementDto>>('/signalements/user/my-reports', params);
  }
}
