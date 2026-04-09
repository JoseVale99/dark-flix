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
    <div class="group relative aspect-poster bg-df-card rounded overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
         (click)="selected.emit(media())">

      @if (!imageLoaded()) {
        <df-skeleton-card class="absolute inset-0 z-0" />
      }

      <img dfLazyImage
           [lazySrc]="media() | wpImage : 'poster'"
           [alt]="media().title"
           (load)="imageLoaded.set(true)"
           class="w-full h-full object-cover transition-opacity duration-300"
           [class.opacity-0]="!imageLoaded()" />

      <!-- Overlay Play Icon -->
      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center z-10">
        <svg xmlns="http://www.svg.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="white" class="w-14 h-14 opacity-80 group-hover:opacity-100 transition-opacity">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" fill="white" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
        </svg>
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

      <!-- Quick Favorite Toggle Button -->
      <button (click)="$event.stopPropagation(); myListService.toggleList(media())"
              title="Añadir/Quitar de Mi Lista"
              class="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 transition-all shadow-md backdrop-blur opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer">
        @if (myListService.isInList(media()._id)) {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#e50914] scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white hover:text-df-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        }
      </button>

      <!-- Title Gradient -->
      <div class="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/90 to-transparent z-20">
        <p class="text-white text-xs font-semibold truncate">{{ media().title }}</p>
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
