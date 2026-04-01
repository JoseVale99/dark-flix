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

  // Redirigir la base URL por el proxy local para matar el CORS
  private readonly baseUrl = environment.production ? 'https://hackstore.mx/wp-api/v1' : '/wp-api/v1';

  getMediaSliders(): Observable<ApiMedia[]> {
    return this.http.get<ApiMediaResponse>(`${this.baseUrl}/sliders?page=1&postType=any&postsPerPage=9`)
      .pipe(map(res => res.data.posts));
  }

  getMoviesList(): Observable<ApiMedia[]> {
    return this.http.get<ApiMediaResponse>(`${this.baseUrl}/listing/movies?page=1&orderBy=latest&order=desc&postType=movies&postsPerPage=12`)
      .pipe(map(res => res.data.posts));
  }

  getTvShowsList(): Observable<ApiMedia[]> {
    return this.http.get<ApiMediaResponse>(`${this.baseUrl}/listing/tvshows?page=1&orderBy=latest&order=desc&postType=tvshows&postsPerPage=12`)
      .pipe(map(res => res.data.posts));
  }

  getAnimesList(): Observable<ApiMedia[]> {
    return this.http.get<ApiMediaResponse>(`${this.baseUrl}/listing/animes?page=1&orderBy=latest&order=desc&postType=animes&postsPerPage=12`)
      .pipe(map(res => res.data.posts));
  }

  getMediaById(id: string | number): Observable<ApiMedia> {
    return this.http.get<ApiMediaResponse>(`${this.baseUrl}/listing/movies?page=1`)
      .pipe(map(res => {
         const match = res.data?.posts?.find(p => p._id == id);
         if (!match) throw new Error('Película no encontrada en página 1');
         return match;
      }));
  }
}
