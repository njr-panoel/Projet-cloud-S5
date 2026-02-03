import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { MAT_DATE_LOCALE } from '@angular/material/core';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { API_BASE_URL } from './core/tokens/api-base-url.token';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { defaultHeadersInterceptor } from './core/interceptors/default-headers.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { mockBackendInterceptor } from './core/interceptors/mock-backend.interceptor';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([mockBackendInterceptor, defaultHeadersInterceptor, authInterceptor, httpErrorInterceptor])
    ),
    {
      provide: API_BASE_URL,
      useValue: environment.apiUrl
    },
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR'
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'fr-FR'
    }
  ]
};
