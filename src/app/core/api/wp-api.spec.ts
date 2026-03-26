import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import * as fc from 'fast-check';
import { WpApiService } from './wp-api';

describe('WpApiService', () => {
  let service: WpApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WpApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /**
   * Propiedad 1: URL siempre construida con BASE correcto
   * Valida: Requisito 2.1
   */
  it('Feature: wp-api-core, Property 1 — URL siempre construida con BASE correcto', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z][a-z0-9-/]*$/),
        (endpoint) => {
          service.get(endpoint).subscribe();

          const req = httpMock.expectOne((r) =>
            r.url.startsWith(service.BASE)
          );
          expect(req.request.url).toBe(`${service.BASE}/${endpoint}`);
          req.flush([]);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Propiedad 2: status='publish' siempre presente
   * Valida: Requisitos 2.2, 2.3
   */
  it('Feature: wp-api-core, Property 2 — status=publish siempre presente en los params', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.stringMatching(/^[a-z]+$/),
          fc.oneof(fc.string(), fc.integer().map(String))
        ),
        (extraParams) => {
          service.get('pelicula', extraParams).subscribe();

          const req = httpMock.expectOne((r) =>
            r.url.startsWith(service.BASE)
          );
          expect(req.request.params.get('status')).toBe('publish');
          req.flush([]);
        }
      ),
      { numRuns: 20 }
    );
  });
});
