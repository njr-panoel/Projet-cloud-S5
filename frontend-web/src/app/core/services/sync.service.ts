import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { SyncLogDto, SyncStatsDto } from '../../models/sync.models';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly api = inject(ApiService);

  toFirebase() {
    return this.api.post<void>('/sync/to-firebase');
  }

  fromFirebase() {
    return this.api.post<void>('/sync/from-firebase');
  }

  stats() {
    return this.api.get<SyncStatsDto>('/sync/stats');
  }

  logs(params?: { success?: boolean; limit?: number }) {
    return this.api.get<SyncLogDto[]>('/sync/logs', params);
  }
}
