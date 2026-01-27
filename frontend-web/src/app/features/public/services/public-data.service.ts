import { Injectable, inject } from '@angular/core';
import { catchError, map, of, timeout } from 'rxjs';

import { SignalementsService } from '../../../core/services/signalements.service';
import { StatsService } from '../../../core/services/stats.service';
import { SignalementDto } from '../../../models/signalement.models';

@Injectable({ providedIn: 'root' })
export class PublicDataService {
  private readonly stats = inject(StatsService);
  private readonly signalements = inject(SignalementsService);

  getStats() {
    return this.stats.getStats();
  }

  getLatestSignalements(limit = 5) {
    return this.signalements.list({ page: 0, size: limit }).pipe(
      timeout({ first: 2500 }),
      map((page) => {
        const content = page.content ?? [];
        return [...content].sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''));
      }),
      catchError(() => of(this.getMockSignalements().slice(0, limit)))
    );
  }

  private getMockSignalements(): SignalementDto[] {
    const now = Date.now();

    return [
      {
        id: 101,
        userId: 10,
        nomUtilisateur: 'Test',
        latitude: -18.8792,
        longitude: 47.5079,
        description: 'Nid-de-poule important (mock)',
        photoUrl: null,
        statut: 'NOUVEAU',
        surfaceM2: 2.5,
        budget: 150000,
        entreprise: 'Entreprise A',
        dateCreation: new Date(now - 2 * 86400000).toISOString(),
        dateUpdate: new Date(now - 2 * 86400000).toISOString()
      },
      {
        id: 102,
        userId: 11,
        nomUtilisateur: 'Test',
        latitude: -18.8725,
        longitude: 47.5162,
        description: 'Chaussée dégradée (mock)',
        photoUrl: null,
        statut: 'EN_COURS',
        surfaceM2: 12,
        budget: 1200000,
        entreprise: 'Entreprise B',
        dateCreation: new Date(now - 6 * 86400000).toISOString(),
        dateUpdate: new Date(now - 1 * 86400000).toISOString()
      },
      {
        id: 103,
        userId: 12,
        nomUtilisateur: 'Test',
        latitude: -18.8913,
        longitude: 47.5033,
        description: 'Tranchée ouverte (mock)',
        photoUrl: null,
        statut: 'TERMINE',
        surfaceM2: 20,
        budget: 2500000,
        entreprise: 'Entreprise D',
        dateCreation: new Date(now - 20 * 86400000).toISOString(),
        dateUpdate: new Date(now - 5 * 86400000).toISOString()
      }
    ];
  }
}
