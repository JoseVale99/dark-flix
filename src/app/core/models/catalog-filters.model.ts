export interface CatalogFilters {
  genre?: number;
  year?: number;
  language?: number;
  quality?: number;
  orderBy?: 'date' | 'title' | 'relevance' | 'modified';
  order?: 'asc' | 'desc';
}
