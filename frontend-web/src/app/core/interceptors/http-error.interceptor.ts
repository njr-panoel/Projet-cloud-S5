import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, retry, throwError, timer } from 'rxjs';

import { AuthService } from '../services/auth.service';

const MAX_RETRIES = 2;

function isRetryableHttpError(err: unknown) {
  if (!(err instanceof HttpErrorResponse)) {
    return false;
  }
  return err.status === 0 || err.status === 408 || err.status === 429 || err.status >= 500;
}

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error, retryCount) => {
        if (req.method !== 'GET' || !isRetryableHttpError(error)) {
          return throwError(() => error);
        }
        const backoffMs = 300 * Math.pow(2, retryCount - 1);
        return timer(backoffMs);
      }
    }),
    catchError((err) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          auth.logout();
        }

        if (err.status === 403) {
          router.navigateByUrl('/');
        }

        const message = (err.error as { message?: string } | null)?.message ?? err.message ?? 'Erreur HTTP';
        return throwError(() => new Error(message));
      }

      if (err instanceof Error) {
        return throwError(() => err);
      }

      return throwError(() => new Error('Erreur inconnue'));
    })
  );
};
