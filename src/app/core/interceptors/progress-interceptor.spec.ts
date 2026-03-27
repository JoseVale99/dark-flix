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

import { progressInterceptor } from '@interceptors/progress-interceptor';
import { ProgressBarService } from '@services/progress-bar';

describe('ProgressInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let progressSvc: ProgressBarService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([progressInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    progressSvc = TestBed.inject(ProgressBarService);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  /**
   * Propiedad 9: Activa la barra solo para URLs que contienen 'wp-json'
   * Valida: Requisitos 10.1, 10.3
   */
  it('Feature: wp-api-core, Property 9 — activa barra solo para URLs con wp-json', () => {
    // URLs que SÍ deben activar la barra
    const wpUrls = [
      'https://hackstore.mx/wp-json/wp/v2/pelicula',
      'https://hackstore.mx/wp-json/wp/v2/serie?page=1',
      'https://hackstore.mx/wp-json/wp/v2/anime',
    ];

    for (const url of wpUrls) {
      const startSpy = vi.spyOn(progressSvc, 'start');
      http.get(url).subscribe();
      httpMock.expectOne(url).flush([]);
      expect(startSpy).toHaveBeenCalledOnce();
      startSpy.mockRestore();
    }
  });

  it('Feature: wp-api-core, Property 9b — NO activa barra para URLs sin wp-json', () => {
    fc.assert(
      fc.property(
        fc.webUrl().filter((url) => !url.includes('wp-json')),
        (url) => {
          const startSpy = vi.spyOn(progressSvc, 'start');
          http.get(url).subscribe({ error: () => {} });
          httpMock.expectOne(url).flush({});
          expect(startSpy).not.toHaveBeenCalled();
          startSpy.mockRestore();
        }
      ),
      { numRuns: 15 }
    );
  });

  it('complete() se llama al finalizar la petición', () => {
    const completeSpy = vi.spyOn(progressSvc, 'complete');
    http.get('https://hackstore.mx/wp-json/wp/v2/pelicula').subscribe();
    httpMock.expectOne((r) => r.url.includes('wp-json')).flush([]);
    expect(completeSpy).toHaveBeenCalledOnce();
  });
});
