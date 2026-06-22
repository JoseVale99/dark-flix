import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { WpTerm } from '@models';
import { WpApiService } from '@api/wp-api';

@Injectable({ providedIn: 'root' })
export class TaxonomyService {
  private readonly api = inject(WpApiService);

  getGenres(): Observable<WpTerm[]> {
    return this.api.get<WpTerm[]>('taxonomy/genres');
  }

  getCountries(): Observable<WpTerm[]> {
    return this.api.get<WpTerm[]>('taxonomy/countries');
  }

  getYears(): Observable<WpTerm[]> {
    return this.api.get<WpTerm[]>('taxonomy/years');
  }

  getQualities(): Observable<WpTerm[]> {
    return this.api.get<WpTerm[]>('taxonomy/qualities');
  }
}
