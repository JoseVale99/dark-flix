import { Component, ChangeDetectionStrategy, inject, signal, computed, DestroyRef, ViewChild, ElementRef, afterNextRender } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CATALOG_GENRES, CATALOG_COUNTRIES, CATALOG_YEARS } from '../../core/constants/filter-config';
import { FilterDropdownComponent } from '@shared/components/filter-dropdown/filter-dropdown';
import { WpMediaService } from '@services/wp-media';
import { MediaGridComponent } from '@shared/components/media-grid/media-grid';
import { ApiMedia } from '@models';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';

@Component({
  selector: 'df-catalog-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MediaGridComponent, FormsModule, FilterDropdownComponent],
  providers: [MediaUrlPipe],
  template: `
    <div class="max-w-400 mx-auto px-4 md:px-8 pt-8 pb-24 md:mt-8 min-h-[70vh]">

      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <!-- Title -->
        <h1 class="text-3xl md:text-5xl font-black capitalize flex items-center gap-3">
          {{ pageTitle() }}
        </h1>

        <!-- Filters Dropdown Panel -->
        <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">

          <df-filter-dropdown
            title="Género"
            searchPlaceholder="Buscar género..."
            [options]="genres"
            [(selected)]="selectedGenres"
            (selectedChange)="onFilterChange()" />

          <df-filter-dropdown
            title="País"
            searchPlaceholder="Buscar país..."
            [options]="countries"
            [(selected)]="selectedCountries"
            (selectedChange)="onFilterChange()" />

          <df-filter-dropdown
            title="Año"
            searchPlaceholder="Buscar año..."
            [options]="years"
            [(selected)]="selectedYears"
            (selectedChange)="onFilterChange()" />

        </div>
      </div>

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
            } @else if (!hasMoreItems()) {
               <p class="text-gray-500 font-bold text-center">Has llegado al final del catálogo.</p>
            }
          </div>
          <!-- Sentinel para Infinite Scroll -->
          <div #scrollSentinel class="h-4"></div>
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
  private destroyRef = inject(DestroyRef);

  @ViewChild('scrollSentinel') private sentinel!: ElementRef<HTMLElement>;

  // Properties
  genres = CATALOG_GENRES;
  countries = CATALOG_COUNTRIES;
  years = CATALOG_YEARS;

  // States
  currentType = signal<string>('peliculas');
  currentPage = signal<number>(1);
  items = signal<ApiMedia[]>([]);
  loading = signal<boolean>(false);
  hasMoreItems = signal<boolean>(true);

  // Active Filters (Arrays to support multiple selection)
  selectedGenres = signal<Array<string|number>>([]);
  selectedCountries = signal<Array<string|number>>([]);
  selectedYears = signal<Array<string|number>>([]);

  pageTitle = computed(() => {
     const t = this.currentType();
     if (t === 'movies' || t === 'peliculas') return 'Películas de Estreno';
     if (t === 'tvshows' || t === 'series') return 'Series de TV';
     if (t === 'animes') return 'Animes Exclusivos';
     return 'Catálogo en Línea';
  });

  constructor() {
    // Escuchar activamente los cambios de categoría (movies/series)
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(params => {
      const paramSlug = params.get('catalogType') || 'peliculas';
      
      if (paramSlug !== this.currentType()) {
         console.log('Cambiando categoría a:', paramSlug);
         this.currentType.set(paramSlug);
         this.selectedGenres.set([]);
         this.selectedYears.set([]);
         this.selectedCountries.set([]);
         this.onFilterChange();
      } else if (this.items().length === 0) {
         this.onFilterChange(); // Primera carga
      }
    });

    // Configurar IntersectionObserver para Infinite Scroll
    afterNextRender(() => {
      if (!this.sentinel?.nativeElement) return;
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) this.loadMore();
      }, { rootMargin: '200px' });
      observer.observe(this.sentinel.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  onFilterChange() {
     console.log('--- [DARKFLIX] Cambio de Filtro Detectado (Manual) ---');
     this.currentPage.set(1);
     this.items.set([]);
     this.hasMoreItems.set(true);
     this.loading.set(false); // Desbloqueo forzado por seguridad
     this.fetchCatalog();
  }

  fetchCatalog() {
    const type = this.currentType();
    const page = this.currentPage();

    // Reset de seguridad para búsquedas nuevas
    if (page === 1) {
      console.log('Reseteando loading para página 1');
      this.loading.set(false);
    }

    if (this.loading()) {
      console.log('Evitando petición duplicada (cargando ya en curso)');
      return;
    }

    this.loading.set(true);

    // Mapeo riguroso a Números para que la API no falle
    const filters: any = {};
    if (this.selectedGenres().length > 0) {
      filters.genres = this.selectedGenres().map(id => Number(id)).filter(n => !isNaN(n));
    }
    if (this.selectedYears().length > 0) {
      filters.years = this.selectedYears().map(id => Number(id)).filter(n => !isNaN(n));
    }
    if (this.selectedCountries().length > 0) {
      filters.countries = this.selectedCountries().map(id => Number(id)).filter(n => !isNaN(n));
    }

    console.log(`Lanzando Petición API -> [${type}] Pag:[${page}] Filters:`, filters);

    this.wpService.getPagedCatalog(type, page, filters).subscribe({
      next: (response) => {
        console.log('Éxito API:', response.posts.length, 'ítems recibidos.');
        this.items.update(current => [...current, ...response.posts]);
        this.hasMoreItems.set(response.hasMore);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error Crítico API:', err);
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
