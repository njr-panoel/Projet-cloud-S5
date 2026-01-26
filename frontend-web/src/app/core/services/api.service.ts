import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE_URL } from '../tokens/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get<T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
    return this.http.get<T>(this.buildUrl(path), { params: this.buildParams(query) });
  }

  post<T>(path: string, body?: unknown, query?: Record<string, string | number | boolean | null | undefined>) {
    return this.http.post<T>(this.buildUrl(path), body ?? null, { params: this.buildParams(query) });
  }

  patch<T>(path: string, body?: unknown, query?: Record<string, string | number | boolean | null | undefined>) {
    return this.http.patch<T>(this.buildUrl(path), body ?? null, { params: this.buildParams(query) });
  }

  delete<T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
    return this.http.delete<T>(this.buildUrl(path), { params: this.buildParams(query) });
  }

  private buildUrl(path: string) {
    const normalizedBase = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  private buildParams(query?: Record<string, string | number | boolean | null | undefined>) {
    let params = new HttpParams();
    if (!query) {
      return params;
    }

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        continue;
      }
      params = params.set(key, String(value));
    }

    return params;
  }
}
