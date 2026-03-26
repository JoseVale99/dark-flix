export interface WpPaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
}

export interface WpSearchResult {
  id: number;
  title: string;
  url: string;
  type: string;
  subtype: string;
}
