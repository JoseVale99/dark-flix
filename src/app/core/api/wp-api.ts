import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

@Injectable({ providedIn: 'root' })
export class WpApiService {
  private readonly http = inject(HttpClient);

  readonly BASE = environment.apiBaseUrl;

  /**
   * GET genérico contra la API de hackstore.mx
   * Base: https://hackstore.mx/wp-api/v1
   */
  get<T>(endpoint: string, params: Record<string, string> = {}): Observable<T> {
    return this.http.get<T>(`${this.BASE}/${endpoint}`, { params });
  }
}
