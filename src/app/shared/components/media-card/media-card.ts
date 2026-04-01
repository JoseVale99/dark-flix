import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { WpPost } from '@models/wp-post.model';
import { SkeletonCardComponent } from '@shared/components/skeleton-card/skeleton-card';
import { LazyImageDirective } from '@shared/directives/lazy-image';
import { WpImagePipe } from '@shared/pipes/wp-image';
import { BadgeComponent } from '@shared/components/badge/badge';

@Component({
  selector: 'df-media-card',
  template: `
    <div class="group relative aspect-poster bg-df-card rounded overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
         (click)="selected.emit(media())">

      @if (!imageLoaded()) {
        <df-skeleton-card class="absolute inset-0 z-0" />
      }

      <img dfLazyImage
           [lazySrc]="media() | wpImage : 'medium'"
           [alt]="media().title.rendered"
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

      <!-- Title Gradient -->
      <div class="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/90 to-transparent z-20">
        <p class="text-white text-xs font-semibold truncate">{{ media().title.rendered }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonCardComponent, LazyImageDirective, WpImagePipe, BadgeComponent]
})
export class MediaCardComponent {
  media = input.required<WpPost>();
  selected = output<WpPost>();

  imageLoaded = signal(false);

  // Helper getters to safely extract metadata if present
  getQuality(): string | null {
    const quality = this.media().meta?.['quality'];
    return typeof quality === 'string' ? quality : null;
  }

  getYear(): string | null {
    const year = this.media().meta?.['year'];
    return typeof year === 'string' ? year : null;
  }
}
