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
   */
  it('Property 1 — URL siempre construida con BASE correcto', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z][a-z0-9-/]*$/),
        (endpoint) => {
          service.get(endpoint).subscribe();
          const req = httpMock.expectOne((r) => r.url.startsWith(service.BASE));
          expect(req.request.url).toBe(`${service.BASE}/${endpoint}`);
          req.flush([]);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Propiedad 2: params se pasan correctamente como query string
   */
  it('Property 2 — params se pasan como query string', () => {
    service.get('listing/movies', { page: '1', orderBy: 'latest' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('listing/movies'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('orderBy')).toBe('latest');
    req.flush({});
  });
});
