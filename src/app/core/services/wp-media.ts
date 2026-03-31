import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WpPost } from '../models/wp-post.model';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class WpMediaService {
  private http = inject(HttpClient);

  // Extraemos la base url desde el environment param parametrizado
  private readonly baseUrl = environment.apiUrl;

  /**
   * Obtiene la primera página de posts del catálogo (con metadata embedida)
   */
  getMediaCatalog(): Observable<WpPost[]> {
    return this.http.get<WpPost[]>(this.baseUrl);
  }
}
