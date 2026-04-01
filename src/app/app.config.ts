import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
  withViewTransitions,
  withComponentInputBinding
} from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { cacheInterceptor } from '@interceptors/cache-interceptor';
import { progressInterceptor } from '@interceptors/progress-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules), withViewTransitions(), withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      // cacheInterceptor primero: respuestas cacheadas no activan la barra de progreso
      withInterceptors([cacheInterceptor, progressInterceptor])
    ),
  ],
};
