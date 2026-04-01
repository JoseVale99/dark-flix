import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ApiMedia } from '@models';
import { MediaCardComponent } from '@shared/components/media-card/media-card';
import { SkeletonCardComponent } from '@shared/components/skeleton-card/skeleton-card';

@Component({
  selector: 'df-media-slider',
  template: `
    <div class="w-full mb-8 relative group">
      <h2 class="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-12">{{ title() }}</h2>

      <!-- Contenedor con scroll nativo oculto pero funcional (Hide scrollbar) -->
      <div
        class="flex gap-2 md:gap-4 overflow-x-auto snap-x snap-mandatory px-4 md:px-12 pb-4 scrollbar-hide"
        style="-ms-overflow-style: none; scrollbar-width: none;">

        @if (loading()) {
            <!-- Skeletons placeholders -->
            @for (item of [1,2,3,4,5,6]; track item) {
                <div class="snap-start shrink-0 w-140 md:w-220">
                    <df-skeleton-card />
                </div>
            }
        } @else {
            @for (media of mediaItems(); track media._id) {
                <div class="snap-start shrink-0 w-140 md:w-220">
                    <df-media-card [media]="media" (selected)="mediaSelected.emit($event)" />
                </div>
            } @empty {
                <p class="text-gray-500">No hay contenido disponible.</p>
            }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MediaCardComponent, SkeletonCardComponent]
})
export class MediaSliderComponent {
  title = input.required<string>();
  mediaItems = input.required<ApiMedia[]>();
  loading = input<boolean>(false);

  mediaSelected = output<ApiMedia>();
}
