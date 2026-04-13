import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

// TTL diferenciado según el tipo de endpoint
const CATALOG_TTL_MS  = 6  * 60 * 60 * 1000; // 6 horas  — listados y sliders
const DETAIL_TTL_MS   = 1  * 60 * 60 * 1000; // 1 hora   — single, players, cast
const STORAGE_PREFIX  = 'df_cache_';
const MAX_ENTRIES     = 120; // evitar saturar localStorage

interface CacheEntry {
  body:      unknown;
  status:    number;
  headers:   Record<string, string>;
  timestamp: number;
  ttl:       number;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function storageKey(url: string): string {
  return STORAGE_PREFIX + btoa(url).slice(0, 80); // clave segura y corta
}

function getTtl(url: string): number {
  // Catálogo / sliders → TTL largo
  if (/\/(listing|sliders)\b/.test(url)) return CATALOG_TTL_MS;
  return DETAIL_TTL_MS;
}

function readCache(key: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, entry: CacheEntry): void {
  try {
    // Garbage-collect si hay demasiadas entradas
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    if (allKeys.length >= MAX_ENTRIES) {
      // Eliminar la entrada más antigua
      const oldest = allKeys
        .map(k => ({ k, ts: (readCache(k)?.timestamp ?? 0) }))
        .sort((a, b) => a.ts - b.ts)[0];
      if (oldest) localStorage.removeItem(oldest.k);
    }
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage lleno — limpiar todo el caché de la app y reintentar
    clearAppCache();
    try { localStorage.setItem(key, JSON.stringify(entry)); } catch { /* sin espacio */ }
  }
}

function clearAppCache(): void {
  Object.keys(localStorage)
    .filter(k => k.startsWith(STORAGE_PREFIX))
    .forEach(k => localStorage.removeItem(k));
}

function buildResponse(entry: CacheEntry): HttpResponse<unknown> {
  return new HttpResponse({
    body:   entry.body,
    status: entry.status,
  });
}

// ── interceptor ───────────────────────────────────────────────────────────────

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo cachear GET y solo URLs de la API de Hackstore
  if (req.method !== 'GET' || !req.url.includes('/wp-api/')) {
    return next(req);
  }

  const key   = storageKey(req.urlWithParams);
  const ttl   = getTtl(req.url);
  const entry = readCache(key);
  const now   = Date.now();

  const isFresh = entry && (now - entry.timestamp) < entry.ttl;
  const isStale = entry && !isFresh;

  // ── CASO 1: Datos frescos → respuesta instantánea ─────────────────────────
  if (isFresh) {
    return of(buildResponse(entry));
  }

  // ── CASO 2: Datos expirados → intenta red y cae al caché si falla ─────────
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.body) {
        writeCache(key, {
          body:      event.body,
          status:    event.status,
          headers:   {},
          timestamp: now,
          ttl,
        });
      }
    }),
    catchError((err: HttpErrorResponse) => {
      // Sin conexión pero hay caché (expirado) → devolver lo que hay guardado
      if (isStale) {
        console.warn('[DarkFlix Cache] Sin conexión, sirviendo caché expirado para:', req.url);
        return of(buildResponse(entry!));
      }
      throw err; // primer uso sin caché → dejar que suba el error
    })
  );
};
