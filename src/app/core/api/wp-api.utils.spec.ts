import * as fc from 'fast-check';
import { buildFilterParams } from './wp-api.utils';
import type { CatalogFilters } from '@models';

/**
 * Propiedad 3: buildFilterParams mapea correctamente los filtros definidos
 * Valida: Requisitos 3.4, 3.5, 3.6, 3.7, 4.4, 5.4
 */
describe('buildFilterParams', () => {
  it('Feature: wp-api-core, Property 3 — mapea filtros definidos y omite los undefined', () => {
    fc.assert(
      fc.property(
        fc.record<CatalogFilters>({
          genre:    fc.option(fc.integer({ min: 1, max: 9999 }), { nil: undefined }),
          year:     fc.option(fc.integer({ min: 1900, max: 2100 }), { nil: undefined }),
          language: fc.option(fc.integer({ min: 1, max: 9999 }), { nil: undefined }),
          quality:  fc.option(fc.integer({ min: 1, max: 9999 }), { nil: undefined }),
          orderBy:  fc.option(fc.constantFrom('date', 'title', 'relevance', 'modified' as const), { nil: undefined }),
          order:    fc.option(fc.constantFrom('asc', 'desc' as const), { nil: undefined }),
        }),
        (filters) => {
          const result = buildFilterParams(filters);

          // Campos definidos → deben estar presentes con el nombre correcto
          if (filters.genre    != null) expect(result['genero']).toBe(filters.genre);
          if (filters.year     != null) expect(result['anio']).toBe(filters.year);
          if (filters.language != null) expect(result['idioma']).toBe(filters.language);
          if (filters.quality  != null) expect(result['calidad']).toBe(filters.quality);
          if (filters.orderBy  != null) expect(result['orderby']).toBe(filters.orderBy);
          if (filters.order    != null) expect(result['order']).toBe(filters.order);

          // Campos undefined → NO deben estar en el resultado
          if (filters.genre    == null) expect(result['genero']).toBeUndefined();
          if (filters.year     == null) expect(result['anio']).toBeUndefined();
          if (filters.language == null) expect(result['idioma']).toBeUndefined();
          if (filters.quality  == null) expect(result['calidad']).toBeUndefined();
          if (filters.orderBy  == null) expect(result['orderby']).toBeUndefined();
          if (filters.order    == null) expect(result['order']).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
