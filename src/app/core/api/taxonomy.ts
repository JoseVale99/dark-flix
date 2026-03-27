import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type { WpTerm } from '@models';
import { WpApiService } from '@api/wp-api';

@Injectable({ providedIn: 'root' })
export class TaxonomyService {
  private readonly api = inject(WpApiService);

  getGenres(): Observable<WpTerm[]> {
    return this.fetchTerms('genero', 100);
  }

  getYears(): Observable<WpTerm[]> {
    return this.fetchTerms('anio', 50);
  }

  getLanguages(): Observable<WpTerm[]> {
    return this.fetchTerms('idioma', 100);
  }

  getQualities(): Observable<WpTerm[]> {
    return this.fetchTerms('calidad', 100);
  }

  private fetchTerms(endpoint: string, perPage: number): Observable<WpTerm[]> {
    return this.api
      .get<WpTerm[]>(endpoint, { per_page: perPage })
      .pipe(map((res) => res.body ?? []));
  }
}
