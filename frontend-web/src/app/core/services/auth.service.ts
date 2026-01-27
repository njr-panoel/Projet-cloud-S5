import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';

import { ApiService } from './api.service';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfileDto } from '../../models/auth.models';
import { SessionService, SessionStorageMode, StoredSession } from './session.service';

export type UserRole = 'USER' | 'MANAGER' | string;

type StoredLoginAttempt = {
  count: number;
  blockedUntil: number | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  private readonly sessionDurationMs = 60 * 60 * 1000;

  readonly user = signal<StoredSession['user'] | null>(this.session.getSession()?.user ?? null);

  constructor() {
    const current = this.session.getSession();
    if (current && this.session.isExpired(current)) {
      this.session.clearSession();
      this.user.set(null);
    }

    this.session.expired$.subscribe(() => {
      this.user.set(null);
      this.router.navigateByUrl('/auth/login');
    });
  }

  login(payload: LoginRequest, mode: SessionStorageMode = 'local') {
    if (this.isLoginBlocked(payload.email)) {
      return throwError(() => new Error('Compte temporairement bloqué après 3 tentatives.'));
    }

    return this.api.post<AuthResponse>('/auth/login', payload).pipe(
      tap((resp) => {
        this.clearAttempts(payload.email);
        this.storeSessionFromAuth(resp, mode);
      }),
      catchError((err) => {
        this.recordFailedAttempt(payload.email);
        return throwError(() => err);
      })
    );
  }

  register(payload: RegisterRequest, mode: SessionStorageMode = 'local') {
    return this.api.post<AuthResponse>('/auth/register', payload).pipe(
      tap((resp) => {
        this.storeSessionFromAuth(resp, mode);
      })
    );
  }

  logout() {
    this.session.clearSession();
    this.user.set(null);
    return this.router.navigateByUrl('/');
  }

  getAccessToken(): string | null {
    const session = this.session.getSession();
    if (!session) {
      return null;
    }
    if (this.session.isExpired(session)) {
      this.session.clearSession();
      this.user.set(null);
      return null;
    }
    return session.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getRole(): UserRole | null {
    return (this.session.getSession()?.user.role as UserRole | undefined) ?? null;
  }

  isManager(): boolean {
    return this.getRole() === 'MANAGER';
  }

  loadProfile() {
    return this.api.get<UserProfileDto>('/auth/me').pipe(
      tap((profile) => {
        const session = this.session.getSession();
        if (!session) {
          return;
        }
        const updated: StoredSession = {
          ...session,
          user: {
            userId: session.user.userId,
            nom: profile.nom,
            email: profile.email,
            role: profile.role
          }
        };

        this.session.setSession(updated, this.session.getSessionMode());
        this.user.set(updated.user);
      })
    );
  }

  updateProfile(payload: { nom: string; email?: string | null }) {
    return this.api.patch<UserProfileDto>('/auth/profile', payload).pipe(
      tap((profile) => {
        const current = this.session.getSession();
        if (!current) {
          return;
        }

        const updated: StoredSession = {
          ...current,
          user: {
            userId: current.user.userId,
            nom: profile.nom,
            email: profile.email,
            role: profile.role
          }
        };

        this.session.setSession(updated, this.session.getSessionMode());
        this.user.set(updated.user);
      })
    );
  }

  changePassword(payload: { oldPassword: string; newPassword: string }) {
    return this.api.patch<void>('/auth/password', payload);
  }

  isLoginBlocked(email: string): boolean {
    const attempt = this.readAttempt(email);
    if (!attempt?.blockedUntil) {
      return false;
    }
    if (Date.now() >= attempt.blockedUntil) {
      this.clearAttempts(email);
      return false;
    }
    return true;
  }

  getBlockedUntil(email: string): number | null {
    const attempt = this.readAttempt(email);
    if (!attempt?.blockedUntil) {
      return null;
    }
    return attempt.blockedUntil;
  }

  private storeSessionFromAuth(resp: AuthResponse, mode: SessionStorageMode) {
    const expiresAt = Date.now() + this.sessionDurationMs;
    const session: StoredSession = {
      accessToken: resp.accessToken,
      refreshToken: resp.refreshToken ?? '',
      expiresAt,
      user: {
        userId: resp.userId,
        nom: resp.nom,
        email: resp.email,
        role: resp.role
      }
    };

    this.session.setSession(session, mode);
    this.user.set(session.user);
  }

  private attemptKey(email: string) {
    return `ri_login_attempt_${email.toLowerCase()}`;
  }

  private readAttempt(email: string): StoredLoginAttempt | null {
    const raw = localStorage.getItem(this.attemptKey(email));
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as StoredLoginAttempt;
    } catch {
      return null;
    }
  }

  private writeAttempt(email: string, attempt: StoredLoginAttempt) {
    localStorage.setItem(this.attemptKey(email), JSON.stringify(attempt));
  }

  private clearAttempts(email: string) {
    localStorage.removeItem(this.attemptKey(email));
  }

  private recordFailedAttempt(email: string) {
    const current = this.readAttempt(email) ?? { count: 0, blockedUntil: null };
    const nextCount = current.count + 1;

    if (nextCount >= 3) {
      const blockedUntil = Date.now() + 30 * 60 * 1000;
      this.writeAttempt(email, { count: nextCount, blockedUntil });
      return;
    }

    this.writeAttempt(email, { count: nextCount, blockedUntil: null });
  }
}
