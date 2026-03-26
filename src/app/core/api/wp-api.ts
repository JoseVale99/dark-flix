import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WpApiService {
  private readonly http = inject(HttpClient);

  readonly BASE = 'https://hackstore.mx/wp-json/wp/v2';

  get<T>(
    endpoint: string,
    params: Record<string, unknown> = {}
  ): Observable<HttpResponse<T>> {
    return this.http.get<T>(`${this.BASE}/${endpoint}`, {
      params: { status: 'publish', ...params } as Record<string, string>,
      observe: 'response',
    });
  }
}
