import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type { CatalogFilters, WpPaginatedResponse, WpPost } from '@models';
import { WpApiService } from '@api/wp-api';
import { buildFilterParams } from '@api/wp-api.utils';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private readonly api = inject(WpApiService);

  getMovies(
    filters: CatalogFilters = {},
    page = 1
  ): Observable<WpPaginatedResponse<WpPost>> {
    return this.api
      .get<WpPost[]>('pelicula', {
        page,
        per_page: 20,
        _embed: true,
        ...buildFilterParams(filters),
      })
      .pipe(
        map((res) => ({
          data: res.body ?? [],
          total: Number(res.headers.get('X-WP-Total') ?? 0),
          totalPages: Number(res.headers.get('X-WP-TotalPages') ?? 0),
        }))
      );
  }

  getMovieBySlug(slug: string): Observable<WpPost | undefined> {
    return this.api
      .get<WpPost[]>('pelicula', { slug, _embed: true })
      .pipe(map((res) => res.body?.[0]));
  }

  getMovieById(id: number): Observable<WpPost> {
    return this.api
      .get<WpPost>(`pelicula/${id}`, { _embed: true })
      .pipe(map((res) => res.body!));
  }
}
