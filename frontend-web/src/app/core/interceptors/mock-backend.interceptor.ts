import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpResponse
} from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.models';
import { AuthResponse } from '../../models/auth.models';
import { SignalementDto } from '../../models/signalement.models';
import { StatsDto } from '../../models/stats.models';
import { UserDto, UserRole } from '../../models/user.models';

let mockUsers: UserDto[] = [
  {
    id: 1,
    email: 'manager@test.com',
    nom: 'Manager',
    prenom: 'Demo',
    telephone: null,
    role: 'MANAGER',
    authProvider: 'LOCAL',
    active: true,
    accountLocked: false,
    lockedUntil: null,
    loginAttempts: 0,
    createdAt: new Date().toISOString(),
    lastLoginAt: null
  },
  {
    id: 2,
    email: 'mobile@test.com',
    nom: 'Mobile',
    prenom: 'Demo',
    telephone: null,
    role: 'UTILISATEUR_MOBILE',
    authProvider: 'LOCAL',
    active: true,
    accountLocked: true,
    lockedUntil: null,
    loginAttempts: 3,
    createdAt: new Date().toISOString(),
    lastLoginAt: null
  }
];

let mockSignalements: SignalementDto[] = [
  {
    id: 1,
    titre: 'Nid de poule',
    description: 'Trou dangereux',
    typeTravaux: 'NIDS_DE_POULE',
    statut: 'NOUVEAU',
    latitude: 47.52,
    longitude: -18.865,
    adresse: 'Antananarivo',
    photos: null,
    user: {
      id: 2,
      email: 'mobile@test.com',
      nom: 'Mobile',
      prenom: 'Demo',
      telephone: null,
      role: 'UTILISATEUR_MOBILE'
    },
    synced: false,
    firebaseId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  }
];

function ok<T>(data: T): HttpEvent<ApiResponse<T>> {
  return new HttpResponse<ApiResponse<T>>({
    status: 200,
    body: {
      success: true,
      data
    }
  });
}

function fail(status: number, message: string): HttpEvent<ApiResponse<null>> {
  return new HttpResponse<ApiResponse<null>>({
    status,
    body: {
      success: false,
      message,
      data: null
    }
  });
}

function computeStats(list: SignalementDto[]): StatsDto {
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
  };
}

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMocks) {
    return next(req);
  }

  const url = req.url;

  if (req.method === 'POST' && url.includes('/auth/login')) {
    const body = req.body as { email?: string } | null;
    const email = body?.email ?? 'manager@test.com';
    const user = mockUsers.find((u) => u.email === email) ?? mockUsers[0];

    const auth: AuthResponse = {
      token: 'mock-jwt-token',
      type: 'Bearer',
      user: {
        ...user
      },
      expiresIn: 3600
    };

    return of(ok(auth));
  }

  if (req.method === 'POST' && url.includes('/auth/register')) {
    const body = req.body as Partial<UserDto> & { email?: string };
    const nextId = Math.max(...mockUsers.map((u) => u.id)) + 1;

    const created: UserDto = {
      id: nextId,
      email: body.email ?? `user${nextId}@test.com`,
      nom: body.nom ?? 'Nom',
      prenom: body.prenom ?? 'Prenom',
      telephone: (body.telephone as string | null | undefined) ?? null,
      role: (body.role as UserRole | undefined) ?? 'VISITEUR',
      authProvider: 'LOCAL',
      active: true,
      accountLocked: false,
      lockedUntil: null,
      loginAttempts: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    };

    mockUsers = [created, ...mockUsers];

    const auth: AuthResponse = {
      token: 'mock-jwt-token',
      type: 'Bearer',
      user: {
        ...created
      },
      expiresIn: 3600
    };

    return of(ok(auth));
  }

  if (req.method === 'GET' && url.includes('/auth/me')) {
    return of(ok('manager@test.com'));
  }

  if (req.method === 'GET' && url.includes('/signalements')) {
    return of(ok(mockSignalements));
  }

  if (req.method === 'GET' && url.includes('/users/locked')) {
    return of(ok(mockUsers.filter((u) => u.accountLocked)));
  }

  if (req.method === 'GET' && url.includes('/users')) {
    return of(ok(mockUsers));
  }

  if (req.method === 'POST' && url.includes('/users/unlock/')) {
    const id = Number(url.split('/users/unlock/')[1]);
    mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, accountLocked: false, lockedUntil: null, loginAttempts: 0 } : u));
    const updated = mockUsers.find((u) => u.id === id);
    return of(updated ? ok(updated) : fail(404, 'Utilisateur introuvable'));
  }

  if (req.method === 'PUT' && url.includes('/users/') && url.includes('/role')) {
    const match = url.match(/\/users\/(\d+)\/role/);
    const id = match ? Number(match[1]) : NaN;
    const role = (req.params.get('role') as UserRole | null) ?? 'VISITEUR';
    mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, role } : u));
    const updated = mockUsers.find((u) => u.id === id);
    return of(updated ? ok(updated) : fail(404, 'Utilisateur introuvable'));
  }

  if (req.method === 'DELETE' && url.includes('/users/')) {
    const match = url.match(/\/users\/(\d+)/);
    const id = match ? Number(match[1]) : NaN;
    mockUsers = mockUsers.filter((u) => u.id !== id);
    return of(ok(null));
  }

  if (req.method === 'GET' && url.includes('/stats')) {
    return of(ok(computeStats(mockSignalements)));
  }

  return throwError(
    () =>
      new HttpErrorResponse({
        status: 404,
        url,
        error: {
          message: 'Mock: endpoint non implémenté'
        }
      })
  );
};
