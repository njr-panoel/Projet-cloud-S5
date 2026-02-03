import { Injectable, inject } from '@angular/core';

import { catchError, map, of, timeout } from 'rxjs';

import { StatsDto } from '../../models/stats.models';
import { SimpleCacheService } from './simple-cache.service';
import { SignalementsService } from './signalements.service';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly api = inject(ApiService);
  private readonly cache = inject(SimpleCacheService);
  private readonly signalements = inject(SignalementsService);

  getStats() {
    const fallback: StatsDto = {
      nbPoints: 0,
      totalSurfaceM2: 0,
      avancementPercent: 0,
      totalBudget: 0,
      nbNouveau: 0,
      nbEnCours: 0,
      nbTermine: 0
    };

    return this.cache.getOrSet$('stats:main', () => {
      return this.api.get<StatsDto>('/stats').pipe(
        timeout({ first: 2500 }),
        catchError(() => {
          return this.signalements.listAll().pipe(
            timeout({ first: 2500 }),
            map((list) => {
              const nbPoints = list.length;
              const nbNouveau = list.filter((s) => s.statut === 'NOUVEAU').length;
              const nbEnCours = list.filter((s) => s.statut === 'EN_COURS').length;
              const nbTermine = list.filter((s) => s.statut === 'TERMINE').length;
              const avancementPercent = nbPoints === 0 ? 0 : Math.round((nbTermine / nbPoints) * 100);

              return {
                nbPoints,
                totalSurfaceM2: 0,
                avancementPercent,
                totalBudget: 0,
                nbNouveau,
                nbEnCours,
                nbTermine
              } satisfies StatsDto;
            }),
            catchError(() => of(fallback))
          );
        })
      );
    }, 10_000);
  }
}
