import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiMedia, ApiMediaResponse } from '@models';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class WpMediaService {
  private http = inject(HttpClient);

  // Nueva Base URL custom
  private readonly baseUrl = 'https://hackstore.mx/wp-api/v1';

  /**
   * Obtiene la data estelar para los Hero Banners
   */
  getMediaSliders(): Observable<ApiMedia[]> {
    return this.http.get<ApiMediaResponse>(`${this.baseUrl}/sliders?page=1&postType=any&postsPerPage=9`)
      .pipe(map(res => res.data.posts));
  }

  /**
   * Obtiene la primera página del catálogo principal de peliculas
   */
  getMediaCatalog(): Observable<ApiMedia[]> {
    return this.http.get<ApiMediaResponse>(`${this.baseUrl}/listing/movies?page=1&orderBy=latest&order=desc&postType=movies&postsPerPage=12`)
      .pipe(map(res => res.data.posts));
  }

  /**
   * Extrae un post mediante ID
   */
  getMediaById(id: string | number): Observable<ApiMedia> {
    // Al no tener confirmación de endpoint unitario, pediremos listado total y filtraremos temporalmente 
    // O si en la doc real es /posts/, esto podria fallar (sujeto a revision)
    return this.http.get<ApiMediaResponse>(`${this.baseUrl}/listing/movies?page=1`)
      .pipe(map(res => {
         const match = res.data?.posts?.find(p => p._id == id);
         if (!match) throw new Error('Película no encontrada en página 1');
         return match;
      }));
  }
}
