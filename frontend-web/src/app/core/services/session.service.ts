import { Injectable } from '@angular/core';
import { Subscription, Subject, timer } from 'rxjs';

type SessionUser = {
  userId: number;
  nom: string;
  email: string;
  role: string;
};

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: SessionUser;
};

export type SessionStorageMode = 'local' | 'session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly sessionKey = 'ri_session';
  private readonly expiredSubject = new Subject<void>();

  private expirySub: Subscription | null = null;

  readonly expired$ = this.expiredSubject.asObservable();

  private storage(mode: SessionStorageMode) {
    return mode === 'session' ? sessionStorage : localStorage;
  }

  setSession(session: StoredSession, mode: SessionStorageMode) {
    localStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem(this.sessionKey);

    this.expirySub?.unsubscribe();
    this.expirySub = null;

    this.storage(mode).setItem(this.sessionKey, JSON.stringify(session));

    const due = Math.max(0, session.expiresAt - Date.now());
    this.expirySub = timer(due).subscribe(() => {
      const current = this.getSession();
      if (current && Date.now() >= current.expiresAt) {
        this.clearSession();
        this.expiredSubject.next();
      }
    });
  }

  getSession(): StoredSession | null {
    const raw = localStorage.getItem(this.sessionKey) ?? sessionStorage.getItem(this.sessionKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  }

  getSessionMode(): SessionStorageMode {
    return sessionStorage.getItem(this.sessionKey) ? 'session' : 'local';
  }

  clearSession() {
    localStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem(this.sessionKey);

    this.expirySub?.unsubscribe();
    this.expirySub = null;
  }

  isExpired(session: StoredSession) {
    return Date.now() >= session.expiresAt;
  }
}
