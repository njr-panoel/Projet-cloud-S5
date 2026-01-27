import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpParams,
  HttpRequest,
  HttpResponse,
  HttpUploadProgressEvent
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { filter, map } from 'rxjs';

import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../../models/api-response.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get<T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
    return this.http
      .get<ApiResponse<T>>(this.buildUrl(path), { params: this.buildParams(query) })
      .pipe(map((resp) => this.unwrap(resp)));
  }

  post<T>(path: string, body?: unknown, query?: Record<string, string | number | boolean | null | undefined>) {
    return this.http
      .post<ApiResponse<T>>(this.buildUrl(path), body ?? null, { params: this.buildParams(query) })
      .pipe(map((resp) => this.unwrap(resp)));
  }

  patch<T>(path: string, body?: unknown, query?: Record<string, string | number | boolean | null | undefined>) {
    return this.http
      .patch<ApiResponse<T>>(this.buildUrl(path), body ?? null, { params: this.buildParams(query) })
      .pipe(map((resp) => this.unwrap(resp)));
  }

  put<T>(path: string, body?: unknown, query?: Record<string, string | number | boolean | null | undefined>) {
    return this.http
      .put<ApiResponse<T>>(this.buildUrl(path), body ?? null, { params: this.buildParams(query) })
      .pipe(map((resp) => this.unwrap(resp)));
  }

  delete<T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
    return this.http
      .delete<ApiResponse<T>>(this.buildUrl(path), { params: this.buildParams(query) })
      .pipe(map((resp) => this.unwrap(resp)));
  }

  uploadWithProgress<T>(
    path: string,
    formData: FormData,
    query?: Record<string, string | number | boolean | null | undefined>
  ) {
    const req = new HttpRequest<FormData>('POST', this.buildUrl(path), formData, {
      params: this.buildParams(query),
      reportProgress: true
    });

    return this.http.request<ApiResponse<T>>(req).pipe(
      filter((event: HttpEvent<ApiResponse<T>>): event is HttpUploadProgressEvent | HttpResponse<ApiResponse<T>> => {
        return event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response;
      }),
      map((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? 0;
          const progress = total === 0 ? 0 : Math.round((event.loaded / total) * 100);
          return { progress };
        }

        const body = event.body as ApiResponse<T>;
        return {
          progress: 100,
          response: this.unwrap(body)
        };
      })
    );
  }

  private unwrap<T>(resp: ApiResponse<T>): T {
    if (!resp.success) {
      throw new Error(resp.message || "Erreur lors de l'appel API");
    }
    return resp.data as T;
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
