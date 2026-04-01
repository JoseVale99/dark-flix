import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { WpPost } from '@models/wp-post.model';
import { MediaCardComponent } from '@shared/components/media-card/media-card';
import { SkeletonCardComponent } from '@shared/components/skeleton-card/skeleton-card';

@Component({
  selector: 'df-media-slider',
  template: `
    <section class="mb-8">
      <!-- Header de la Fila -->
      <div class="px-4 mb-3 flex items-center justify-between">
        <h2 class="text-white text-xl md:text-2xl font-bold tracking-tight">{{ title() }}</h2>
        <!-- Optional "Explore All" link could go here -->
      </div>

      <!-- Carrusel -->
      <!-- Usamos hide-scrollbar, snap-x snap-mandatory y flex-nowrap para la experiencia de deslizamiento -->
      <div class="flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-4 hide-scrollbar">
        @if (isLoading()) {
          <!-- Skeletons en fila -->
          @for (s of [1,2,3,4,5,6]; track s) {
            <div class="shrink-0 w-36 md:w-52 snap-start">
              <df-skeleton-card class="block w-full h-full aspect-poster" />
            </div>
          }
        } @else {
          <!-- Items reales -->
          @for (post of mediaItems(); track post.id) {
            <div class="shrink-0 w-36 md:w-52 snap-start hover:z-10 relative">
              <df-media-card
                [media]="post"
                (selected)="mediaSelected.emit($event)"
                class="block w-full h-full" />
            </div>
          } @empty {
            <div class="w-full text-center text-df-muted py-6 bg-df-card rounded">
              No hay contenido disponible para esta categoría.
            </div>
          }
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MediaCardComponent, SkeletonCardComponent]
})
export class MediaSliderComponent {
  title = input<string>('Explorar');
  mediaItems = input<WpPost[]>([]);
  isLoading = input<boolean>(false);
  
  mediaSelected = output<WpPost>();
}
