import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { HistoriqueDto } from '../../models/historique.models';

@Injectable({ providedIn: 'root' })
export class HistoriqueService {
  private readonly api = inject(ApiService);

  getForSignalement(signalementId: number) {
    return this.api.get<HistoriqueDto[]>(`/historiques/${signalementId}`);
  }
}
