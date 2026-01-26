import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  unblockUser(userId: number) {
    return this.api.post<void>(`/admin/unblock/${userId}`);
  }
}
