import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';

import { ApiService } from './api.service';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfileDto } from '../../models/auth.models';

export type UserRole = 'USER' | 'MANAGER' | string;

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    userId: number;
    nom: string;
    email: string;
    role: UserRole;
  };
};

type StoredLoginAttempt = {
  count: number;
  blockedUntil: number | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly user = signal<StoredSession['user'] | null>(this.readSession()?.user ?? null);

  login(payload: LoginRequest) {
    if (this.isLoginBlocked(payload.email)) {
      return throwError(() => new Error('Compte temporairement bloqué après 3 tentatives.'));
    }

    return this.api.post<AuthResponse>('/auth/login', payload).pipe(
      tap((resp) => {
        this.clearAttempts(payload.email);
        this.storeSessionFromAuth(resp);
      }),
      catchError((err) => {
        this.recordFailedAttempt(payload.email);
        return throwError(() => err);
      })
    );
  }

  register(payload: RegisterRequest) {
    return this.api.post<AuthResponse>('/auth/register', payload).pipe(
      tap((resp) => {
        this.storeSessionFromAuth(resp);
      })
    );
  }

  logout() {
    localStorage.removeItem('ri_session');
    this.user.set(null);
    return this.router.navigateByUrl('/');
  }

  getAccessToken(): string | null {
    const session = this.readSession();
    if (!session) {
      return null;
    }
    if (Date.now() >= session.expiresAt) {
      return null;
    }
    return session.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getRole(): UserRole | null {
    return this.readSession()?.user.role ?? null;
  }

  isManager(): boolean {
    return this.getRole() === 'MANAGER';
  }

  loadProfile() {
    return this.api.get<UserProfileDto>('/auth/me').pipe(
      tap((profile) => {
        const session = this.readSession();
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
        localStorage.setItem('ri_session', JSON.stringify(updated));
        this.user.set(updated.user);
      })
    );
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

  private storeSessionFromAuth(resp: AuthResponse) {
    const expiresAt = Date.now() + resp.expiresIn * 1000;
    const session: StoredSession = {
      accessToken: resp.accessToken,
      refreshToken: resp.refreshToken,
      expiresAt,
      user: {
        userId: resp.userId,
        nom: resp.nom,
        email: resp.email,
        role: resp.role
      }
    };
    localStorage.setItem('ri_session', JSON.stringify(session));
    this.user.set(session.user);
  }

  private readSession(): StoredSession | null {
    const raw = localStorage.getItem('ri_session');
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
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
