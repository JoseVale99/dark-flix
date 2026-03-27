import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type { WpSearchResult } from '@models';
import { WpApiService } from '@api/wp-api';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly api = inject(WpApiService);

  search(
    query: string,
    type?: 'pelicula' | 'serie' | 'anime'
  ): Observable<WpSearchResult[]> {
    const params: Record<string, unknown> = {
      search: query,
      type: 'post',
      per_page: 20,
    };

    if (type != null) params['subtype'] = type;

    return this.api
      .get<WpSearchResult[]>('search', params)
      .pipe(map((res) => res.body ?? []));
  }
}
