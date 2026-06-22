/**
 * Filtros del catálogo — refleja la estructura JSON real de hackstore.mx
 * La API espera: filter={"genres":[855],"countries":[910,728],"years":[52]}
 */
export interface CatalogFilters {
  genres?: number[];
  countries?: number[];
  years?: number[];
  qualities?: number[];
}

export type PostType = 'movies' | 'series' | 'animes';
export type OrderBy = 'latest' | 'rating' | 'title' | 'year';
export type Order = 'asc' | 'desc';
