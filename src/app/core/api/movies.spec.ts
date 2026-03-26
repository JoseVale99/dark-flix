import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import * as fc from 'fast-check';

import { MoviesService } from './movies';
import type { WpPost } from '../models';

// Generador de WpPost mínimo
const wpPostArb = (): fc.Arbitrary<WpPost> =>
  fc.record({
    id: fc.integer({ min: 1, max: 99999 }),
    slug: fc.string({ minLength: 1, maxLength: 50 }),
    title: fc.record({ rendered: fc.string() }),
    excerpt: fc.record({ rendered: fc.string() }),
    content: fc.record({ rendered: fc.string() }),
    featured_media: fc.integer({ min: 0 }),
    meta: fc.constant({}),
  });

describe('MoviesService — property-based tests', () => {
  let service: MoviesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MoviesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /**
   * Propiedad 4: Mapeo de paginación extrae total y totalPages de los headers
   * Valida: Requisitos 3.1, 4.1, 5.1
   */
  it('Feature: wp-api-core, Property 4 — paginación extrae total y totalPages de headers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 9999 }),
        fc.integer({ min: 0, max: 500 }),
        fc.array(wpPostArb(), { minLength: 0, maxLength: 3 }),
        (total, totalPages, posts) => {
          let result: { total: number; totalPages: number } | undefined;

          service.getMovies().subscribe((r) => (result = r));

          http
            .expectOne((r) => r.url.includes('pelicula'))
            .flush(posts, {
              headers: {
                'X-WP-Total': String(total),
                'X-WP-TotalPages': String(totalPages),
              },
            });

          expect(result?.total).toBe(total);
          expect(result?.totalPages).toBe(totalPages);
        }
      ),
      { numRuns: 25 }
    );
  });

  /**
   * Propiedad 5: getBySlug retorna el primer elemento del array de respuesta
   * Valida: Requisitos 3.2, 4.2, 5.2
   */
  it('Feature: wp-api-core, Property 5 — getBySlug retorna el primer elemento', () => {
    fc.assert(
      fc.property(
        fc.array(wpPostArb(), { minLength: 1, maxLength: 3 }),
        fc.stringMatching(/^[a-z0-9-]+$/),
        (posts, slug) => {
          let result: WpPost | undefined;

          service.getMovieBySlug(slug).subscribe((r) => (result = r));

          http
            .expectOne((r) => r.url.includes('pelicula'))
            .flush(posts);

          expect(result).toEqual(posts[0]);
        }
      ),
      { numRuns: 25 }
    );
  });
});
