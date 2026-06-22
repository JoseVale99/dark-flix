import * as fc from 'fast-check';
import { buildFilterParam } from './wp-api.utils';
import type { CatalogFilters } from '@models';

describe('buildFilterParam', () => {
  it('Property 3 — mapea filtros definidos y omite arrays vacíos', () => {
    fc.assert(
      fc.property(
        fc.record<CatalogFilters>({
          genres:    fc.option(fc.array(fc.integer({ min: 1, max: 9999 }), { minLength: 1, maxLength: 3 }), { nil: undefined }),
          countries: fc.option(fc.array(fc.integer({ min: 1, max: 9999 }), { minLength: 1, maxLength: 3 }), { nil: undefined }),
          years:     fc.option(fc.array(fc.integer({ min: 1, max: 200 }), { minLength: 1, maxLength: 3 }), { nil: undefined }),
          qualities: fc.option(fc.array(fc.integer({ min: 1, max: 9999 }), { minLength: 1, maxLength: 3 }), { nil: undefined }),
        }),
        (filters) => {
          const result = buildFilterParam(filters);
          const parsed = JSON.parse(result);

          if (filters.genres?.length)    expect(parsed.genres).toEqual(filters.genres);
          else                           expect(parsed.genres).toBeUndefined();

          if (filters.countries?.length) expect(parsed.countries).toEqual(filters.countries);
          else                           expect(parsed.countries).toBeUndefined();

          if (filters.years?.length)     expect(parsed.years).toEqual(filters.years);
          else                           expect(parsed.years).toBeUndefined();

          if (filters.qualities?.length) expect(parsed.qualities).toEqual(filters.qualities);
          else                           expect(parsed.qualities).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('retorna {} cuando no hay filtros', () => {
    expect(buildFilterParam({})).toBe('{}');
  });

  it('genera JSON válido para filtros reales de hackstore.mx', () => {
    const result = buildFilterParam({ genres: [855], countries: [910, 728], years: [52] });
    expect(result).toBe('{"genres":[855],"countries":[910,728],"years":[52]}');
  });
});
