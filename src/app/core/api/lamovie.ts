import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import type {
  ApiEmbed,
  ApiEpisode,
  ApiEpisodeResponse,
  ApiMedia,
  ApiMediaResponse,
  ApiPlayerResponse,
} from '@models';
import { LAMOVIE_SOURCE } from '@core/constants/external-sources';

/**
 * Servidor interno de LaMovie.
 *
 * LaMovie usa el mismo backend "wp-api" que hackstore, así que reutilizamos
 * los mismos endpoints para resolver la ficha (por slug o por título), sus
 * episodios y sus embeds. De esta forma sus servidores se suman a la lista
 * interna del reproductor en vez de abrir enlaces externos.
 *
 * Todas las peticiones pasan por `/lm-api` (proxy de Vercel / dev server)
 * para evitar CORS.
 */
@Injectable({ providedIn: 'root' })
export class LamovieService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = LAMOVIE_SOURCE.apiBase;

  /**
   * Devuelve los embeds de LaMovie para una película o para el episodio
   * seleccionado de una serie/anime.
   */
  getEmbeds(media: ApiMedia, episode?: ApiEpisode): Observable<ApiEmbed[]> {
    const postType = this.toPostType(media.type);

    return this.resolve(media, postType).pipe(
      switchMap((match) => {
        if (!match) return of([]);

        if (postType === 'movies') {
          return this.getPlayers(match._id);
        }

        // Series/animes: se necesita el episodio concreto de LaMovie.
        if (!episode) return of([]);

        return this.findEpisode(match._id, episode).pipe(
          switchMap((found) => (found ? this.getPlayers(found._id) : of([]))),
        );
      }),
      map((embeds) =>
        embeds.map((embed) => ({
          ...embed,
          server: embed.server ? `${LAMOVIE_SOURCE.serverPrefix} · ${embed.server}` : LAMOVIE_SOURCE.name,
        })),
      ),
      catchError(() => of([])),
    );
  }

  /** Resuelve la ficha de LaMovie: primero por slug, luego por título. */
  private resolve(media: ApiMedia, postType: string): Observable<ApiMedia | null> {
    const slug = (media.slug || '').trim();

    const bySlug$ = slug
      ? this.http
          .get<{ data: ApiMedia }>(`${this.baseUrl}/single/${postType}`, {
            params: { slug, postType },
          })
          .pipe(
            map((res) => (res?.data?._id ? res.data : null)),
            catchError(() => of(null)),
          )
      : of(null);

    return bySlug$.pipe(
      switchMap((found) => (found ? of(found) : this.search(media.title, postType))),
    );
  }

  /** Búsqueda por título cuando el slug de hackstore no existe en LaMovie. */
  private search(title: string, postType: string): Observable<ApiMedia | null> {
    const query = this.cleanTitle(title);
    if (!query) return of(null);

    return this.http
      .get<ApiMediaResponse>(`${this.baseUrl}/search`, {
        params: { postType, q: query, postsPerPage: '10' },
      })
      .pipe(
        map((res) => this.pickBest(res?.data?.posts || [], query)),
        catchError(() => of(null)),
      );
  }

  /** Busca el episodio equivalente dentro de la temporada de LaMovie. */
  private findEpisode(showId: string | number, episode: ApiEpisode): Observable<ApiEpisode | null> {
    const season = episode.season_number || 1;

    return this.http
      .get<ApiEpisodeResponse>(`${this.baseUrl}/single/episodes/list`, {
        params: {
          _id: String(showId),
          season: String(season),
          page: '1',
          postsPerPage: '100',
        },
      })
      .pipe(
        map(
          (res) =>
            (res?.data?.posts || []).find(
              (candidate) =>
                Number(candidate.episode_number) === Number(episode.episode_number),
            ) || null,
        ),
        catchError(() => of(null)),
      );
  }

  private getPlayers(postId: string | number): Observable<ApiEmbed[]> {
    return this.http
      .get<ApiPlayerResponse>(`${this.baseUrl}/player`, {
        params: { postId: String(postId), demo: '0' },
      })
      .pipe(
        map((res) => res?.data?.embeds || []),
        catchError(() => of([])),
      );
  }

  private toPostType(type: string): 'movies' | 'tvshows' | 'animes' {
    if (type === 'tvshows' || type === 'series') return 'tvshows';
    if (type === 'animes') return 'animes';
    return 'movies';
  }

  /** Elige el resultado cuyo título coincide mejor; evita abrir otra película. */
  private pickBest(posts: ApiMedia[], title: string): ApiMedia | null {
    const target = this.normalize(title);
    if (!target) return null;

    const scored = posts
      .filter((post) => post.type !== 'episodes')
      .map((post) => {
        const candidate = this.normalize(post.title);
        let score = 0;
        if (candidate === target) score = 3;
        else if (candidate.startsWith(target) || target.startsWith(candidate)) score = 2;
        else if (candidate.includes(target) || target.includes(candidate)) score = 1;
        return { post, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored[0]?.post || null;
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalize(value: string): string {
    return this.cleanTitle(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
}
