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
    return this.signalements.listAll().pipe(
      timeout({ first: 2500 }),
      map((list) => {
        const sorted = [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        return sorted.slice(0, limit);
      }),
      catchError(() => of(this.getMockSignalements().slice(0, limit)))
    );
  }

  private getMockSignalements(): SignalementDto[] {
    const now = Date.now();

    return [
      {
        id: 101,
        titre: 'Signalement (mock)',
        description: 'Nid-de-poule important (mock)',
        typeTravaux: 'NIDS_DE_POULE',
        statut: 'NOUVEAU',
        latitude: -18.8792,
        longitude: 47.5079,
        adresse: 'Antananarivo',
        photos: null,
        user: {
          id: 10,
          email: 'test@example.com',
          nom: 'Test',
          prenom: 'User',
          telephone: null,
          role: 'VISITEUR'
        },
        synced: false,
        firebaseId: null,
        createdAt: new Date(now - 2 * 86400000).toISOString(),
        updatedAt: new Date(now - 2 * 86400000).toISOString(),
        completedAt: null
      },
      {
        id: 102,
        titre: 'Signalement (mock)',
        description: 'Chaussée dégradée (mock)',
        typeTravaux: 'FISSURE',
        statut: 'EN_COURS',
        latitude: -18.8725,
        longitude: 47.5162,
        adresse: 'Antananarivo',
        photos: null,
        user: {
          id: 11,
          email: 'test2@example.com',
          nom: 'Test',
          prenom: 'User',
          telephone: null,
          role: 'VISITEUR'
        },
        synced: false,
        firebaseId: null,
        createdAt: new Date(now - 6 * 86400000).toISOString(),
        updatedAt: new Date(now - 1 * 86400000).toISOString(),
        completedAt: null
      },
      {
        id: 103,
        titre: 'Signalement (mock)',
        description: 'Tranchée ouverte (mock)',
        typeTravaux: 'SIGNALISATION',
        statut: 'TERMINE',
        latitude: -18.8913,
        longitude: 47.5033,
        adresse: 'Antananarivo',
        photos: null,
        user: {
          id: 12,
          email: 'test3@example.com',
          nom: 'Test',
          prenom: 'User',
          telephone: null,
          role: 'VISITEUR'
        },
        synced: true,
        firebaseId: 'mock123',
        createdAt: new Date(now - 20 * 86400000).toISOString(),
        updatedAt: new Date(now - 5 * 86400000).toISOString(),
        completedAt: null
      }
    ];
  }
}
