import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { ApiMedia } from '@models';
import { SkeletonCardComponent } from '@shared/components/skeleton-card/skeleton-card';
import { LazyImageDirective } from '@shared/directives/lazy-image';
import { WpImagePipe } from '@shared/pipes/wp-image';
import { BadgeComponent } from '@shared/components/badge/badge';
import { MyListService } from '@services/my-list';

@Component({
  selector: 'df-media-card',
  template: `
    <div class="group/card relative aspect-poster bg-df-card rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:ring-1 hover:ring-white/20"
         (click)="selected.emit(media())">

      @if (!imageLoaded()) {
        <df-skeleton-card class="absolute inset-0 z-0" />
      }

      <!-- Imagen del poster -->
      <img dfLazyImage
           [lazySrc]="media() | wpImage : 'poster'"
           [alt]="media().title"
           (load)="imageLoaded.set(true)"
           class="w-full h-full object-cover transition-all duration-500 group-hover/card:scale-110 group-hover/card:brightness-50"
           [class.opacity-0]="!imageLoaded()" />

      <!-- Gradiente base siempre visible desde abajo (título legible) -->
      <div class="absolute inset-0 z-10 bg-linear-to-t from-black/80 via-black/10 to-transparent
                  group-hover/card:from-black/95 group-hover/card:via-black/60 group-hover/card:to-black/20
                  transition-all duration-500">
      </div>

      <!-- Metadata Badges -->
      <div class="absolute top-2 left-2 flex gap-1 z-20">
        @if (getQuality()) {
          <df-badge [text]="getQuality()!" variant="quality" />
        }
        @if (getYear()) {
          <df-badge [text]="getYear()!" variant="default" />
        }
      </div>

      <!-- Quick Favorite Button -->
      <button (click)="$event.stopPropagation(); myListService.toggleList(media())"
              title="Añadir/Quitar de Mi Lista"
              class="group/fav absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 transition-all shadow-md backdrop-blur cursor-pointer
                     opacity-100 md:opacity-0 md:group-hover/card:opacity-100">
        @if (myListService.isInList(media()._id)) {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#e50914]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white group-hover/fav:text-[#e50914] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        }
      </button>

      <!-- Título siempre visible + Botón solo en hover desktop -->
      <div class="absolute bottom-0 left-0 right-0 z-20 p-2.5 flex flex-col gap-1.5">
        <p class="text-white font-bold text-xs leading-tight line-clamp-2 drop-shadow-lg">
          {{ media().title }}
        </p>
        <!-- Botón solo visible en desktop al hacer hover de la TARJETA -->
        <button class="hidden md:flex w-full items-center justify-center gap-1.5 bg-[#e50914] hover:bg-red-700 active:scale-95 text-white text-xs font-bold py-1.5 rounded-md transition-all shadow-lg cursor-pointer
                       opacity-0 group-hover/card:opacity-100 translate-y-1 group-hover/card:translate-y-0 duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-3 h-3 shrink-0">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Ver ahora
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonCardComponent, LazyImageDirective, WpImagePipe, BadgeComponent]
})
export class MediaCardComponent {
  media = input.required<ApiMedia>();
  selected = output<ApiMedia>();

  public myListService = inject(MyListService);

  imageLoaded = signal(false);

  getQuality(): string | null {
    return this.media().quality?.length ? 'HD' : null;
  }

  getYear(): string | null {
    const rd = this.media().release_date;
    return rd ? rd.split('-')[0] : null;
  }
}
