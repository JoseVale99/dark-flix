import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  provideHttpClient,
  withInterceptors,
  HttpClient,
} from '@angular/common/http';
import { vi } from 'vitest';
import * as fc from 'fast-check';
import { cacheInterceptor } from '@interceptors/cache-interceptor';

const HTTP_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'] as const;

describe('CacheInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Limpiar el cache entre tests (reimportar el módulo no es posible,
    // pero el cache se limpia al expirar el TTL con fake timers)
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  /**
   * Propiedad 6: Solo cachea peticiones GET
   * Valida: Requisito 8.1
   */
  it('Feature: wp-api-core, Property 6 — solo cachea peticiones GET', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...HTTP_METHODS),
        fc.webUrl(),
        (method, url) => {
          // Peticiones no-GET deben pasar sin cachear
          http.request(method, url).subscribe({ error: () => {} });
          const req = httpMock.expectOne(url);
          expect(req.request.method).toBe(method);
          req.flush({});
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Propiedad 7: Round-trip de caché dentro del TTL
   * Valida: Requisitos 8.2, 8.3
   */
  it('Feature: wp-api-core, Property 7 — segunda petición GET dentro del TTL usa caché', () => {
    const url = 'https://hackstore.mx/wp-json/wp/v2/pelicula?page=1';
    const mockData = [{ id: 1, title: 'Test' }];

    // Primera petición — va a la red
    let firstResult: unknown;
    http.get(url).subscribe((r) => (firstResult = r));
    httpMock.expectOne(url).flush(mockData);

    // Segunda petición dentro del TTL — debe venir del caché (sin nueva request HTTP)
    let secondResult: unknown;
    http.get(url).subscribe((r) => (secondResult = r));
    httpMock.expectNone(url); // no debe haber nueva petición HTTP

    expect(secondResult).toEqual(firstResult);
  });

  /**
   * Propiedad 8: TTL invalida entradas expiradas
   * Valida: Requisito 8.4
   */
  it('Feature: wp-api-core, Property 8 — TTL invalida entradas expiradas', () => {
    const url = 'https://hackstore.mx/wp-json/wp/v2/serie?page=1';

    // Primera petición — se cachea
    http.get(url).subscribe();
    httpMock.expectOne(url).flush([]);

    // Avanzar el tiempo más allá del TTL (5 min + 1ms)
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);

    // Segunda petición — debe ir a la red porque el TTL expiró
    http.get(url).subscribe();
    httpMock.expectOne(url).flush([]); // debe existir una nueva petición HTTP
  });
});
