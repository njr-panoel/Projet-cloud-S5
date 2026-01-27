import { Injectable, inject } from '@angular/core';

import { catchError, of, timeout } from 'rxjs';

import { ApiService } from './api.service';
import { StatsDto } from '../../models/stats.models';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly api = inject(ApiService);

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

    return this.api.get<StatsDto>('/stats').pipe(timeout({ first: 2500 }), catchError(() => of(fallback)));
  }
}
