import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type { CatalogFilters, WpPaginatedResponse, ApiMedia } from '@models';
import { WpApiService } from '@api/wp-api';
import { buildFilterParams } from '@api/wp-api.utils';

@Injectable({ providedIn: 'root' })
export class SeriesService {
  private readonly api = inject(WpApiService);

  getSeries(
    filters: CatalogFilters = {},
    page = 1
  ): Observable<WpPaginatedResponse<ApiMedia>> {
    return this.api
      .get<ApiMedia[]>('serie', {
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

  getSerieBySlug(slug: string): Observable<ApiMedia | undefined> {
    return this.api
      .get<ApiMedia[]>('serie', { slug, _embed: true })
      .pipe(map((res) => res.body?.[0]));
  }

  getSerieById(id: number): Observable<ApiMedia> {
    return this.api
      .get<ApiMedia>(`serie/${id}`, { _embed: true })
      .pipe(map((res) => res.body!));
  }
}
