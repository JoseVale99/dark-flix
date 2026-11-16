import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiMedia } from '@models';

/**
 * Navegación centralizada a la ficha de cualquier contenido
 * (películas, series, animes). Permite abrir en la misma pestaña
 * o en una pestaña nueva de forma consistente en toda la app.
 */
@Injectable({ providedIn: 'root' })
export class MediaNavigationService {
  private platformId = inject(PLATFORM_ID);

  /** Devuelve la ruta SEO de la ficha (`/peliculas/slug`, `/series/slug`, `/animes/slug`). */
  buildUrl(media: ApiMedia | null | undefined): string {
    if (!media) return '/';

    let prefix = 'peliculas';
    if (media.type === 'tvshows') prefix = 'series';
    else if (media.type === 'animes') prefix = 'animes';

    return `/${prefix}/${media.slug}`;
  }

  /** Abre la ficha en una pestaña nueva. */
  openInNewTab(media: ApiMedia): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.open(this.buildUrl(media), '_blank', 'noopener,noreferrer');
  }
}
