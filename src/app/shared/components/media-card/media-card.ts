import { Component, ChangeDetectionStrategy, input, output, signal, inject, computed } from '@angular/core';
import { ApiMedia } from '@models';
import { SkeletonCardComponent } from '@shared/components/skeleton-card/skeleton-card';
import { LazyImageDirective } from '@shared/directives/lazy-image';
import { WpImagePipe } from '@shared/pipes/wp-image';
import { BadgeComponent } from '@shared/components/badge/badge';
import { PosterPlaceholderComponent } from '@shared/components/poster-placeholder/poster-placeholder';
import { MyListService } from '@services/my-list';
import { MediaNavigationService } from '@services/media-navigation';

@Component({
  selector: 'df-media-card',
  template: `
    <div class="group/card relative aspect-poster bg-df-card rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:z-50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:ring-1 hover:ring-white/20">

      @if (posterUrl() && !imageLoaded()) {
        <df-skeleton-card class="absolute inset-0 z-0" />
      }

      <!-- Imagen del poster (o portada genérica si no hay) -->
      @if (posterUrl()) {
        <img dfLazyImage
             [lazySrc]="posterUrl()"
             [alt]="media().title"
             (load)="imageLoaded.set(true)"
             (error)="posterFailed.set(true)"
             class="w-full h-full object-cover transition-all duration-500 ease-out group-hover/card:scale-105 group-hover/card:brightness-[0.72]"
             [class.opacity-0]="!imageLoaded()" />
      } @else {
        <df-poster-placeholder class="z-0" />
      }

      <!-- Scrim inferior: legibilidad del título sin apagar el arte del poster -->
      <div class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[68%] bg-linear-to-t
                  from-black/95 via-black/45 to-transparent
                  transition-opacity duration-300">
      </div>

      <!-- Enlace real: el clic derecho ofrece "Abrir en una pestaña nueva" y
           Ctrl/Cmd/Clic central también funcionan de forma nativa -->
      <a class="absolute inset-0 z-20 cursor-pointer"
         [href]="mediaNavigation.buildUrl(media())"
         [attr.aria-label]="'Abrir ' + media().title"
         (click)="onCardClick($event)"></a>

      <!-- Metadata Badges -->
      <div class="absolute top-2 left-2 flex gap-1 z-30 pointer-events-none">
        @if (getQuality()) {
          <df-badge [text]="getQuality()!" variant="quality" />
        }
        @if (getYear()) {
          <df-badge [text]="getYear()!" variant="default" />
        }
      </div>

      <!-- Acción rápida: favorito -->
      <div class="absolute top-2 right-2 z-40 flex gap-1">
        <!-- Quick Favorite Button -->
        <button (click)="$event.stopPropagation(); myListService.toggleList(media())"
              title="Añadir/Quitar de Mi Lista"
              class="group/fav p-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 transition-all shadow-md backdrop-blur cursor-pointer
                     opacity-100 md:opacity-0 md:group-hover/card:opacity-100">
        @if (myListService.isInList(media()._id)) {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-df-accent" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white group-hover/fav:text-df-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        }
        </button>
      </div>

      <!-- Pie: título + metadatos; el CTA sube desde abajo al hacer hover en desktop -->
      <div class="absolute bottom-0 left-0 right-0 z-30 flex flex-col gap-1.5
                  px-2.5 md:px-3 pt-10 pb-2.5 md:pb-3 pointer-events-none">

        <div class="flex flex-col gap-1.5 transition-transform duration-300 ease-out
                    md:group-hover/card:-translate-y-10">
          <p class="text-white font-bold text-[13px] leading-snug line-clamp-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
            {{ media().title }}
          </p>

          <!-- Metadatos compactos: rating · año -->
          <div class="flex items-center gap-1.5 text-[10px] font-semibold text-white/55">
            @if (getRating()) {
              <span class="inline-flex items-center gap-0.5 text-yellow-400 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {{ getRating() }}
              </span>
              @if (getYear()) {
                <span class="h-1 w-1 rounded-full bg-white/30"></span>
              }
            }
            @if (getYear()) {
              <span>{{ getYear() }}</span>
            }
          </div>
        </div>

        <!-- CTA premium (solo desktop, aparece al hacer hover) -->
        <a [href]="mediaNavigation.buildUrl(media())"
           (click)="onCardClick($event)"
           [attr.aria-label]="'Ver ' + media().title"
           class="pointer-events-auto absolute left-2.5 right-2.5 md:left-3 md:right-3 bottom-2.5 md:bottom-3 hidden md:flex items-center justify-center gap-1.5 py-2 rounded-full
                  bg-linear-to-b from-df-accent to-df-accent-dark text-white
                  text-[11px] font-black uppercase tracking-wider
                  shadow-df-glow transition-all duration-300 cursor-pointer
                  opacity-0 translate-y-3
                  group-hover/card:opacity-100 group-hover/card:translate-y-0
                  hover:from-df-accent-hover hover:to-df-accent-strong hover:shadow-df-glow-lg active:scale-[0.97]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-3 h-3 shrink-0">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Ver ahora
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SkeletonCardComponent,
    LazyImageDirective,
    BadgeComponent,
    PosterPlaceholderComponent,
  ]
})
export class MediaCardComponent {
  media = input.required<ApiMedia>();
  selected = output<ApiMedia>();

  public myListService = inject(MyListService);
  public mediaNavigation = inject(MediaNavigationService);

  private readonly wpImage = new WpImagePipe();

  imageLoaded = signal(false);
  posterFailed = signal(false);

  /** URL del poster; vacía si no existe o si la imagen falló al cargar. */
  posterUrl = computed(() =>
    this.posterFailed() ? '' : this.wpImage.transform(this.media(), 'poster'),
  );

  /**
   * Click normal = navegación SPA (emite `selected`).
   * Con Ctrl/Cmd/Shift/Alt no se cancela el evento: el navegador abre el enlace
   * en una pestaña nueva de forma nativa, igual que el clic derecho o el botón central.
   */
  onCardClick(event: MouseEvent): void {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    this.selected.emit(this.media());
  }

  getQuality(): string | null {
    return this.media().quality?.length ? 'HD' : null;
  }

  getYear(): string | null {
    const rd = this.media().release_date;
    return rd ? rd.split('-')[0] : null;
  }

  getRating(): string | null {
    const r = parseFloat(this.media().rating ?? '0');
    return r > 0 ? r.toFixed(1) : null;
  }
}
