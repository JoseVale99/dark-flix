import { Component, ChangeDetectionStrategy, inject, signal, effect, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, MediaGridComponent, FormsModule, FilterDropdownComponent],
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
            (selectedChange)="applyFilters()" />
            
          <df-filter-dropdown
            title="País"
            searchPlaceholder="Buscar país..."
            [options]="countries"
            [(selected)]="selectedCountries"
            (selectedChange)="applyFilters()" />

          <df-filter-dropdown
            title="Año"
            searchPlaceholder="Buscar año..."
            [options]="years"
            [(selected)]="selectedYears"
            (selectedChange)="applyFilters()" />

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
  private destroyRef = inject(DestroyRef); // Inyector nativo para auto-limpieza

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
    // Load initial query params splitting commans into arrays
    const qParams = this.route.snapshot.queryParamMap;
    if (qParams.has('genres')) this.selectedGenres.set(qParams.get('genres')!.split(','));
    if (qParams.has('years')) this.selectedYears.set(qParams.get('years')!.split(','));
    if (qParams.has('countries')) this.selectedCountries.set(qParams.get('countries')!.split(','));

    // Escuchar activamente los cambios de ruta principal
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const paramSlug = params.get('catalogType');
      if (paramSlug) {
        if (paramSlug !== this.currentType()) { // Only reset filters if switching category (e.g., from movies to series)
           this.selectedGenres.set([]);
           this.selectedYears.set([]);
           this.selectedCountries.set([]);
        }
        this.currentType.set(paramSlug);
        this.currentPage.set(1);
        this.items.set([]);
        this.hasMoreItems.set(true);
        this.fetchCatalog();
      }
    });
  }

  applyFilters() {
     this.currentPage.set(1);
     this.items.set([]);
     this.hasMoreItems.set(true);
     
     // Sincronizar hacia el Query URL activo de forma silenciosa (sin recargar la pagina)
     this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
           genres: this.selectedGenres().length > 0 ? this.selectedGenres().join(',') : null,
           years: this.selectedYears().length > 0 ? this.selectedYears().join(',') : null,
           countries: this.selectedCountries().length > 0 ? this.selectedCountries().join(',') : null
        },
        queryParamsHandling: 'merge'
     });
     
     this.fetchCatalog();
  }

  fetchCatalog() {
    if (this.loading()) return;
    this.loading.set(true);
    const type = this.currentType();
    const page = this.currentPage();

    // Formando el objecto dinamico para wpService
    const filterObject: any = {};
    if (this.selectedGenres().length > 0) filterObject.genres = this.selectedGenres();
    if (this.selectedYears().length > 0) filterObject.years = this.selectedYears();
    if (this.selectedCountries().length > 0) filterObject.countries = this.selectedCountries();

    this.wpService.getPagedCatalog(type, page, filterObject).subscribe({
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
