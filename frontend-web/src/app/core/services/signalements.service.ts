import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import {
  CreateSignalementRequest,
  SignalementDto,
  StatutSignalement,
  UpdateSignalementRequest
} from '../../models/signalement.models';

@Injectable({ providedIn: 'root' })
export class SignalementsService {
  private readonly api = inject(ApiService);

  listAll() {
    return this.api.get<SignalementDto[]>('/signalements');
  }

  getById(id: number) {
    return this.api.get<SignalementDto>(`/signalements/${id}`);
  }

  create(payload: CreateSignalementRequest) {
    return this.api.post<SignalementDto>('/signalements', payload);
  }

  update(id: number, payload: UpdateSignalementRequest) {
    return this.api.put<SignalementDto>(`/signalements/${id}`, payload as unknown as Record<string, unknown>);
  }

  updateStatut(id: number, statut: StatutSignalement) {
    return this.api.patch<SignalementDto>(`/signalements/${id}/statut`, null, { statut });
  }

  delete(id: number) {
    return this.api.delete<void>(`/signalements/${id}`);
  }
}
