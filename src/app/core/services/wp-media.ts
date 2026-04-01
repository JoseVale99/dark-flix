import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiMedia, ApiMediaResponse, ApiPlayerResponse, ApiRelatedResponse, ApiCastResponse, ApiCast } from '@models';
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

  // ---- NUEVOS ENDPOINTS ESTILO "NETFLIX EXPANDIDO" ----

  getMoviePlayers(postId: string | number): Observable<ApiPlayerResponse['data']> {
    return this.http.get<ApiPlayerResponse>(`${this.baseUrl}/player?postId=${postId}&demo=0`)
      .pipe(map(res => res.data));
  }

  getMovieDownloads(postId: string | number): Observable<any[]> {
    // El payload asume s=7 y d=1 por defecto según Hackstore API para retornar el array directo
    return this.http.get<{error: boolean, data: any[]}>(`${this.baseUrl}/player?postId=${postId}&demo=0&s=7&d=1`)
      .pipe(map(res => res.data));
  }

  getRelatedMedia(postId: string | number): Observable<ApiMedia[]> {
    return this.http.get<ApiRelatedResponse>(`${this.baseUrl}/single/related?postId=${postId}&page=1&tab=connections&postsPerPage=6`)
      .pipe(map(res => res.data.posts));
  }

  getMovieCast(postId: string | number, type: string = 'movies'): Observable<ApiCast[]> {
    return this.http.get<ApiCastResponse>(`${this.baseUrl}/cast/${type}/${postId}`)
      .pipe(map(res => res.data));
  }

  registerHit(postId: string | number, type: string = 'movies'): Observable<boolean> {
    const nocache = new Date().getTime();
    return this.http.get<{error: boolean, data: boolean}>(`${this.baseUrl}/hit?nocache=${nocache}&_id=${postId}&type=${type}`)
      .pipe(map(res => res.data));
  }
}

