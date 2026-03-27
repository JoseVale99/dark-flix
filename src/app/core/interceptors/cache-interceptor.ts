import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { of } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<unknown>;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

// Map declarado fuera de la función para persistir entre requests en la sesión
const cache = new Map<string, CacheEntry>();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo cachear peticiones GET
  if (req.method !== 'GET') return next(req);

  const cached = cache.get(req.urlWithParams);

  // Cache hit dentro del TTL → retornar respuesta cacheada
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return of(cached.response.clone() as HttpResponse<unknown>);
  }

  // Cache miss o expirado → hacer la petición y almacenar
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req.urlWithParams, {
          response: event.clone(),
          timestamp: Date.now(),
        });
      }
    })
  );
};
