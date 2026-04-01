import { Component, ChangeDetectionStrategy, input, output, ViewChild, ElementRef } from '@angular/core';
import { ApiMedia } from '@models';
import { MediaCardComponent } from '@shared/components/media-card/media-card';
import { SkeletonCardComponent } from '@shared/components/skeleton-card/skeleton-card';

@Component({
  selector: 'df-media-slider',
  template: `
    <div class="w-full mb-8 relative group">
      <h2 class="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-12">{{ title() }}</h2>

      <!-- Botón Anterior -->
      <button 
        (click)="scrollLeft()"
        class="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-2/3 bg-black/60 hidden md:flex items-center justify-center z-30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 hover:scale-110 rounded-r-lg cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
      </button>

      <!-- Botón Siguiente -->
       <button 
        (click)="scrollRight()"
        class="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-2/3 bg-black/60 hidden md:flex items-center justify-center z-30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 hover:scale-110 rounded-l-lg cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
      </button>

      <!-- Contenedor con scroll nativo oculto pero funcional (Hide scrollbar) -->
      <div 
        #sliderRef
        class="flex gap-2 md:gap-4 overflow-x-auto snap-x snap-mandatory px-4 md:px-12 pb-4 scroll-smooth scrollbar-hide"
        style="-ms-overflow-style: none; scrollbar-width: none;">

        @if (loading()) {
            <!-- Skeletons placeholders -->
            @for (item of [1,2,3,4,5,6]; track item) {
                <div class="snap-start shrink-0 w-36 md:w-48 lg:w-56">
                    <df-skeleton-card />
                </div>
            }
        } @else {
            @for (media of mediaItems(); track media._id) {
                <div class="snap-start shrink-0 w-36 md:w-48 lg:w-56">
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

  @ViewChild('sliderRef') sliderRef!: ElementRef<HTMLDivElement>;

  scrollLeft() {
    if (this.sliderRef) {
      this.sliderRef.nativeElement.scrollBy({ left: -400, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.sliderRef) {
      this.sliderRef.nativeElement.scrollBy({ left: 400, behavior: 'smooth' });
    }
  }
}
