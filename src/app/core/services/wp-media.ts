import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiMedia, ApiMediaResponse, ApiPlayerResponse, ApiRelatedResponse, ApiCastResponse, ApiCast, ApiEpisodeResponse } from '@models';
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

  getMediaBySlug(slug: string, postType: string): Observable<ApiMedia> {
    return this.http.get<{error: boolean, message: string, data: ApiMedia}>(`${this.baseUrl}/single/${postType}?slug=${slug}&postType=${postType}`)
      .pipe(map(res => {
         if (res.error || !res.data) throw new Error('Media no encontrada por Slug');
         // A veces el backend de hackstore no inserta type firmemente en el single
         res.data.type = postType;
         return res.data;
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

  // Obtenemos los episodios y las temporadas para una serie de TV
  getTvShowEpisodes(showId: string | number, season: string | number = 1): Observable<ApiEpisodeResponse['data']> {
    return this.http.get<ApiEpisodeResponse>(`${this.baseUrl}/single/episodes/list?_id=${showId}&season=${season}&page=1&postsPerPage=50`)
      .pipe(map(res => res.data));
  }

  // Buscador Universal
  searchMedia(query: string): Observable<ApiMedia[]> {
    return this.http.get<{error: boolean, data: {posts: ApiMedia[]}}>(`${this.baseUrl}/search?q=${query}`)
      .pipe(map(res => res.data.posts || []));
  }
}

