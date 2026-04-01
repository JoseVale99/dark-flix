import { Component, ChangeDetectionStrategy, input, output, ViewChild, ElementRef } from '@angular/core';
import { ApiMedia } from '@models';
import { MediaCardComponent } from '@shared/components/media-card/media-card';
import { SkeletonCardComponent } from '@shared/components/skeleton-card/skeleton-card';

@Component({
  selector: 'df-media-slider',
  template: `
    <div class="w-full mb-8 md:mb-12 relative group">
      <h2 class="text-lg md:text-2xl font-bold text-gray-200 mb-2 md:mb-4 px-4 md:px-12 transition-colors hover:text-white cursor-pointer inline-flex items-center gap-2 group/title">
        {{ title() }}
        <span class="text-sm text-df-accent opacity-0 group-hover/title:opacity-100 transition-opacity font-bold tracking-wider hidden md:block">Explorar todos ❯</span>
      </h2>

      <!-- Zona del Carrusel con padding Vertical para que el scale-110 de las tarjetas no se recite -->
      <div class="relative w-full">
        <!-- Botón Anterior (Estilo original Netflix - Área 100% alta al borde) -->
        <button 
          (click)="scrollLeft()"
          class="absolute left-0 top-0 bottom-0 w-[4%] min-w-[40px] bg-black/50 hover:bg-black/70 hidden md:flex items-center justify-center z-40 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-r-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-8 h-8 hover:scale-125 transition-transform"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
        </button>

        <!-- Botón Siguiente (Estilo original Netflix - Área 100% alta al borde) -->
        <button 
          (click)="scrollRight()"
          class="absolute right-0 top-0 bottom-0 w-[4%] min-w-[40px] bg-black/50 hover:bg-black/70 hidden md:flex items-center justify-center z-40 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-l-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-8 h-8 hover:scale-125 transition-transform"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>

        <!-- Contenedor con scroll -->
        <div 
          #sliderRef
          class="flex gap-2 md:gap-3 overflow-x-auto overflow-y-visible snap-x snap-mandatory px-4 md:px-12 py-6 scroll-smooth scrollbar-hide"
          style="-ms-overflow-style: none; scrollbar-width: none;">

          @if (loading()) {
              <!-- Skeletons placeholders -->
              @for (item of [1,2,3,4,5,6,7,8]; track item) {
                  <div class="snap-start shrink-0 w-32 md:w-40 lg:w-48">
                      <df-skeleton-card />
                  </div>
              }
          } @else {
              @for (media of mediaItems(); track media._id) {
                  <div class="snap-start shrink-0 w-32 md:w-40 lg:w-48 relative z-0 hover:z-50">
                      <df-media-card [media]="media" (selected)="mediaSelected.emit($event)" />
                  </div>
              } @empty {
                  <p class="text-gray-500">No hay contenido disponible.</p>
              }
          }
        </div>
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
      const el = this.sliderRef.nativeElement;
      const scrollAmount = el.clientWidth * 0.75;
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.sliderRef) {
      const el = this.sliderRef.nativeElement;
      const scrollAmount = el.clientWidth * 0.75;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}
