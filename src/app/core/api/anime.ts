import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { CatalogFilters, OrderBy, Order } from '@models';
import { WpApiService } from '@api/wp-api';
import { buildFilterParam } from '@api/wp-api.utils';
import type { ListingResponse } from '@api/movies';

@Injectable({ providedIn: 'root' })
export class AnimeService {
  private readonly api = inject(WpApiService);

  getAnime(
    filters: CatalogFilters = {},
    page = 1,
    orderBy: OrderBy = 'latest',
    order: Order = 'desc',
    postsPerPage = 18
  ): Observable<ListingResponse<unknown>> {
    return this.api.get<ListingResponse<unknown>>('listing/animes', {
      filter: buildFilterParam(filters),
      page: String(page),
      orderBy,
      order,
      postType: 'animes',
      postsPerPage: String(postsPerPage),
    });
  }
}
