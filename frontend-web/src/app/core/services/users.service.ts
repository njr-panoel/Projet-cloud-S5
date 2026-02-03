import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { AuthResponse, RegisterRequest } from '../../models/auth.models';
import { UserDto, UserRole } from '../../models/user.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiService);

  list() {
    return this.api.get<UserDto[]>('/users');
  }

  listLocked() {
    return this.api.get<UserDto[]>('/users/locked');
  }

  unlock(id: number) {
    return this.api.post<UserDto>(`/users/unlock/${id}`);
  }

  updateRole(id: number, role: UserRole) {
    return this.api.put<UserDto>(`/users/${id}/role`, null, { role });
  }

  delete(id: number) {
    return this.api.delete<void>(`/users/${id}`);
  }

  createUser(payload: RegisterRequest) {
    return this.api.post<AuthResponse>('/auth/register', payload);
  }
}
