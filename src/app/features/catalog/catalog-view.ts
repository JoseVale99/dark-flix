import { Component, ChangeDetectionStrategy, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WpMediaService } from '@services/wp-media';
import { MediaGridComponent } from '@shared/components/media-grid/media-grid';
import { ApiMedia } from '@models';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';

@Component({
  selector: 'df-catalog-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MediaGridComponent],
  providers: [MediaUrlPipe],
  template: `
    <div class="max-w-400 mx-auto px-4 md:px-8 pt-8 pb-24 md:mt-8 min-h-[70vh]">
      
      <!-- Title -->
      <h1 class="text-3xl md:text-5xl font-black mb-8 capitalize flex items-center gap-3">
        {{ pageTitle() }}
      </h1>

      @if (items().length === 0 && loading()) {
        <div class="flex items-center justify-center py-32">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-df-accent"></div>
        </div>
      } @else {
        
        <df-media-grid 
          [title]="''" 
          [mediaItems]="items()" 
          (mediaSelected)="onMediaSelected($event)" />

        @if (items().length > 0) {
          <div class="mt-16 flex justify-center">
            @if (loading()) {
               <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            } @else if (hasMoreItems()) {
               <button (click)="loadMore()" 
                       class="text-white bg-white/10 hover:bg-white/20 border border-white/20 font-bold py-4 px-12 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-3 text-lg cursor-pointer">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                 </svg>
                 Cargar Más
               </button>
            } @else {
               <p class="text-gray-500 font-bold text-center">Has llegado al final del catálogo.</p>
            }
          </div>
        }
      }
    </div>
  `
})
export class CatalogViewComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private wpService = inject(WpMediaService);
  private mediaUrlPipe = inject(MediaUrlPipe);

  // States
  currentType = signal<string>('peliculas');
  currentPage = signal<number>(1);
  items = signal<ApiMedia[]>([]);
  loading = signal<boolean>(false);
  hasMoreItems = signal<boolean>(true);

  pageTitle = computed(() => {
     const t = this.currentType();
     if (t === 'movies' || t === 'peliculas') return 'Películas de Estreno';
     if (t === 'tvshows' || t === 'series') return 'Series de TV';
     if (t === 'animes') return 'Animes Exclusivos';
     return 'Catálogo en Línea';
  });

  constructor() {
    // Escuchar activamente los cambios en la ruta y no solo el primer pantallazo
    this.route.paramMap.subscribe(params => {
      const paramSlug = params.get('catalogType');
      if (paramSlug) {
        this.currentType.set(paramSlug);
        this.currentPage.set(1);
        this.items.set([]);
        this.hasMoreItems.set(true);
        this.fetchCatalog();
      }
    });
  }

  fetchCatalog() {
    if (this.loading()) return;
    this.loading.set(true);
    const type = this.currentType();
    const page = this.currentPage();

    this.wpService.getPagedCatalog(type, page).subscribe({
      next: (response) => {
        // Using spread operator to append perfectly
        this.items.update(current => [...current, ...response.posts]);
        this.hasMoreItems.set(response.hasMore);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadMore() {
    if (this.hasMoreItems() && !this.loading()) {
      this.currentPage.update(p => p + 1);
      this.fetchCatalog();
    }
  }

  onMediaSelected(media: ApiMedia) {
    const url = this.mediaUrlPipe.transform(media);
    const segments = url.split('/').filter(s => s !== '');
    this.router.navigate(['/', ...segments], { state: { media } });
  }
}
