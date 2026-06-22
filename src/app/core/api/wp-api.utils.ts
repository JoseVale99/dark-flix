import type { CatalogFilters } from '@models';

/**
 * Construye el parámetro `filter` como JSON string para la API de hackstore.mx.
 *
 * Ejemplo de salida:
 *   buildFilterParam({ genres: [855], countries: [910, 728], years: [52] })
 *   → '{"genres":[855],"countries":[910,728],"years":[52]}'
 *
 * Solo incluye claves con arrays no vacíos.
 */
export function buildFilterParam(filters: CatalogFilters): string {
  const obj: Record<string, number[]> = {};

  if (filters.genres?.length)    obj['genres']    = filters.genres;
  if (filters.countries?.length) obj['countries'] = filters.countries;
  if (filters.years?.length)     obj['years']     = filters.years;
  if (filters.qualities?.length) obj['qualities'] = filters.qualities;

  return JSON.stringify(obj);
}
