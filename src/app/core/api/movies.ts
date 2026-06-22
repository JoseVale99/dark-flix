import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { CatalogFilters, OrderBy, Order } from '@models';
import { WpApiService } from '@api/wp-api';
import { buildFilterParam } from '@api/wp-api.utils';

/** Respuesta real de la API /wp-api/v1/listing/movies */
export interface ListingResponse<T> {
  posts: T[];
  totalPosts: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private readonly api = inject(WpApiService);

  /**
   * GET /wp-api/v1/listing/movies
   * Params: filter (JSON), page, orderBy, order, postType, postsPerPage
   */
  getMovies(
    filters: CatalogFilters = {},
    page = 1,
    orderBy: OrderBy = 'latest',
    order: Order = 'desc',
    postsPerPage = 18
  ): Observable<ListingResponse<unknown>> {
    return this.api.get<ListingResponse<unknown>>('listing/movies', {
      filter: buildFilterParam(filters),
      page: String(page),
      orderBy,
      order,
      postType: 'movies',
      postsPerPage: String(postsPerPage),
    });
  }
}
