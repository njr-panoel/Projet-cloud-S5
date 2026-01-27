import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

type CacheEntry<T> = {
  expiresAt: number;
  value$: Observable<T>;
};

@Injectable({ providedIn: 'root' })
export class SimpleCacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  getOrSet$<T>(key: string, factory: () => Observable<T>, ttlMs: number): Observable<T> {
    const now = Date.now();
    const existing = this.store.get(key) as CacheEntry<T> | undefined;

    if (existing && existing.expiresAt > now) {
      return existing.value$;
    }

    const value$ = factory().pipe(shareReplay({ bufferSize: 1, refCount: false }));
    this.store.set(key, { expiresAt: now + ttlMs, value$ });
    return value$;
  }

  invalidate(keyPrefix?: string) {
    if (!keyPrefix) {
      this.store.clear();
      return;
    }

    for (const key of this.store.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.store.delete(key);
      }
    }
  }
}
