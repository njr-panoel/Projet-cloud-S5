import { HttpInterceptorFn } from '@angular/common/http';

export const defaultHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const isFormData = typeof FormData !== 'undefined' && req.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json'
  };

  if (!isFormData && !req.headers.has('Content-Type') && req.method !== 'GET' && req.method !== 'DELETE') {
    headers['Content-Type'] = 'application/json';
  }

  return next(req.clone({ setHeaders: headers }));
};
