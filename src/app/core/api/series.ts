import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type { CatalogFilters, WpPaginatedResponse, WpPost } from '../models';
import { WpApiService } from './wp-api';
import { buildFilterParams } from './wp-api.utils';

@Injectable({ providedIn: 'root' })
export class SeriesService {
  private readonly api = inject(WpApiService);

  getSeries(
    filters: CatalogFilters = {},
    page = 1
  ): Observable<WpPaginatedResponse<WpPost>> {
    return this.api
      .get<WpPost[]>('serie', {
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

  getSerieBySlug(slug: string): Observable<WpPost | undefined> {
    return this.api
      .get<WpPost[]>('serie', { slug, _embed: true })
      .pipe(map((res) => res.body?.[0]));
  }

  getSerieById(id: number): Observable<WpPost> {
    return this.api
      .get<WpPost>(`serie/${id}`, { _embed: true })
      .pipe(map((res) => res.body!));
  }
}
