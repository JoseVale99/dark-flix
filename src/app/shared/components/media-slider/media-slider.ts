import { Component, ChangeDetectionStrategy, input, output, ViewChild, ElementRef, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { ApiMedia } from '@models';
import { MediaCardComponent } from '@shared/components/media-card/media-card';
import { SkeletonCardComponent } from '@shared/components/skeleton-card/skeleton-card';

@Component({
  selector: 'df-media-slider',
  template: `
    <div class="w-full mb-8 md:mb-12 relative group" (mouseenter)="checkScroll()">
      <h2 class="text-lg md:text-2xl font-bold text-gray-200 mb-2 md:mb-4 px-14 md:px-20 transition-colors hover:text-white cursor-pointer inline-flex items-center gap-2 group/title">
        {{ title() }}
        <span class="text-sm text-df-accent opacity-0 group-hover/title:opacity-100 transition-opacity font-bold tracking-wider hidden md:block">Explorar todos ❯</span>
      </h2>

      <!-- Zona del Carrusel con padding Vertical para que el scale-110 de las tarjetas no se recite -->
      <div class="relative w-full">
        <!-- Botón Anterior (Estilo Circular Seguro para Hover) -->
        <button
          (click)="scrollLeft()"
          [class.hidden]="!canScrollLeft()"
          [class.md:flex]="canScrollLeft()"
          class="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 bg-[#141414]/90 hover:bg-[#202020] border border-gray-500/40 rounded-full items-center justify-center z-70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer shadow-lg backdrop-blur-sm hidden">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
        </button>

        <!-- Botón Siguiente (Estilo Circular Seguro para Hover) -->
        <button
          (click)="scrollRight()"
          [class.hidden]="!canScrollRight()"
          [class.md:flex]="canScrollRight()"
          class="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 bg-[#141414]/90 hover:bg-[#202020] border border-gray-500/40 rounded-full items-center justify-center z-70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer shadow-lg backdrop-blur-sm hidden">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>

        <!-- Contenedor con scroll padding ancho -->
        <div
          #sliderRef
          (scroll)="checkScroll()"
          class="flex gap-2 md:gap-3 overflow-x-auto overflow-y-visible snap-x snap-mandatory px-14 md:px-20 py-6 scroll-smooth scrollbar-hide"
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
export class MediaSliderComponent implements AfterViewInit, OnDestroy {
  title = input.required<string>();
  mediaItems = input.required<ApiMedia[]>();
  loading = input<boolean>(false);

  mediaSelected = output<ApiMedia>();

  @ViewChild('sliderRef') sliderRef!: ElementRef<HTMLDivElement>;

  canScrollLeft = signal(false);
  canScrollRight = signal(true);
  private observer: ResizeObserver | null = null;

  ngAfterViewInit() {
    setTimeout(() => this.checkScroll(), 100);

    if (typeof window !== 'undefined' && this.sliderRef) {
      this.observer = new ResizeObserver(() => this.checkScroll());
      this.observer.observe(this.sliderRef.nativeElement);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  checkScroll() {
    if (!this.sliderRef) return;
    const el = this.sliderRef.nativeElement;

    // Actualizar márgenes de scrolleo con tolerancia de 2px
    this.canScrollLeft.set(el.scrollLeft > 2);
    this.canScrollRight.set(Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - 2);
  }

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
