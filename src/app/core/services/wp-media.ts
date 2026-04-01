import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WpPost } from '@models/wp-post.model';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class WpMediaService {
  private http = inject(HttpClient);

  // Extraemos la base url limpia
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Obtiene la primera página de posts del catálogo (con metadata embedida)
   */
  getMediaCatalog(): Observable<WpPost[]> {
    return this.http.get<WpPost[]>(`${this.baseUrl}/posts?_embed`);
  }

  /**
   * Extrae la metadata completa de un solo post mediante ID
   */
  getMediaById(id: string | number): Observable<WpPost> {
    return this.http.get<WpPost>(`${this.baseUrl}/posts/${id}?_embed`);
  }
}
