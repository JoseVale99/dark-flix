import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
} from '@angular/core';
import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
  withViewTransitions,
  withComponentInputBinding,
  TitleStrategy,
} from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { cacheInterceptor } from '@interceptors/cache-interceptor';
import { progressInterceptor } from '@interceptors/progress-interceptor';
import { I18nTitleStrategy } from '@core/i18n/i18n-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules), withViewTransitions(), withComponentInputBinding()),
    { provide: TitleStrategy, useClass: I18nTitleStrategy },
    provideHttpClient(
      withFetch(),
      // cacheInterceptor primero: respuestas cacheadas no activan la barra de progreso
      withInterceptors([cacheInterceptor, progressInterceptor])
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
};
