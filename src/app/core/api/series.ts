import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { CatalogFilters, OrderBy, Order } from '@models';
import { WpApiService } from '@api/wp-api';
import { buildFilterParam } from '@api/wp-api.utils';
import type { ListingResponse } from '@api/movies';

@Injectable({ providedIn: 'root' })
export class SeriesService {
  private readonly api = inject(WpApiService);

  getSeries(
    filters: CatalogFilters = {},
    page = 1,
    orderBy: OrderBy = 'latest',
    order: Order = 'desc',
    postsPerPage = 18
  ): Observable<ListingResponse<unknown>> {
    return this.api.get<ListingResponse<unknown>>('listing/series', {
      filter: buildFilterParam(filters),
      page: String(page),
      orderBy,
      order,
      postType: 'series',
      postsPerPage: String(postsPerPage),
    });
  }
}
