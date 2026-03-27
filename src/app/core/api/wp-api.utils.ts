import type { CatalogFilters } from '@models';

/**
 * Convierte un objeto CatalogFilters a los query params
 * que espera la WP REST API de hackstore.mx.
 * Solo incluye los campos que están definidos (no null ni undefined).
 */
export function buildFilterParams(
  filters: CatalogFilters
): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (filters.genre    != null) params['genero']  = filters.genre;
  if (filters.year     != null) params['anio']    = filters.year;
  if (filters.language != null) params['idioma']  = filters.language;
  if (filters.quality  != null) params['calidad'] = filters.quality;
  if (filters.orderBy  != null) params['orderby'] = filters.orderBy;
  if (filters.order    != null) params['order']   = filters.order;

  return params;
}
