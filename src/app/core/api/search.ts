import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { WpSearchResult } from '@models';
import { WpApiService } from '@api/wp-api';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly api = inject(WpApiService);

  search(
    query: string,
    postType?: 'movies' | 'series' | 'animes'
  ): Observable<WpSearchResult[]> {
    const params: Record<string, string> = { search: query };
    if (postType) params['postType'] = postType;
    return this.api.get<WpSearchResult[]>('search', params);
  }
}
