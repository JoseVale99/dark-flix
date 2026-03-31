import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WpPost } from '../models/wp-post.model';

@Injectable({
  providedIn: 'root'
})
export class WpMediaService {
  private http = inject(HttpClient);
  
  // Usaremos ruta relativa para que funcione fácilmente con un proxy local: proxy.conf.json en Angular o proxy Vite
  private readonly baseUrl = '/wp-json/wp/v2/posts';

  /**
   * Obtiene la primera página de posts del catálogo (con metadata embedida)
   */
  getMediaCatalog(): Observable<WpPost[]> {
    // ?_embed es absolutamente vital en WordPress Headless para poder traer los "featuredmedia" en una sola petición
    return this.http.get<WpPost[]>(`${this.baseUrl}?_embed`);
  }
}
