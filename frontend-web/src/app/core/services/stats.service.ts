import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { StatsDto } from '../../models/stats.models';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly api = inject(ApiService);

  getStats() {
    return this.api.get<StatsDto>('/stats');
  }
}
