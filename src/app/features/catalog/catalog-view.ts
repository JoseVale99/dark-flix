import { Component, ChangeDetectionStrategy, inject, signal, computed, DestroyRef, ViewChild, ElementRef, afterNextRender } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subject, switchMap, map, scan, tap, filter, catchError, of } from 'rxjs';
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
  loading = signal<boolean>(false);
  hasMoreItems = signal<boolean>(true);

  // Active Filters (Arrays to support multiple selection)
  selectedGenres = signal<Array<string|number>>([]);
  selectedCountries = signal<Array<string|number>>([]);
  selectedYears = signal<Array<string|number>>([]);

  // Stream Trigger
  private searchTrigger$ = new Subject<{ replace: boolean }>();

  // Stream de datos puramente reactivo (Sin fugas de memoria)
  private catalogStream$ = this.searchTrigger$.pipe(
    tap(() => this.loading.set(true)),
    switchMap(({ replace }) => {
      const type = this.currentType();
      const page = this.currentPage();
      const filters = this.getNumericFilters();

      return this.wpService.getPagedCatalog(type, page, filters).pipe(
        map(response => ({ response, replace })),
        catchError(() => {
          this.loading.set(false);
          return of(null);
        })
      );
    }),
    filter((data): data is {response: {posts: ApiMedia[], hasMore: boolean}, replace: boolean} => data !== null),
    tap(data => {
      this.hasMoreItems.set(data.response.hasMore);
      this.loading.set(false);
    }),
    scan((acc: ApiMedia[], curr: {response: {posts: ApiMedia[]}, replace: boolean}) => {
      if (curr.replace) return curr.response.posts;
      return [...acc, ...curr.response.posts];
    }, [] as ApiMedia[])
  );

  // El Signal de items ahora depende directamente del stream sin .subscribe() manual
  items = toSignal(this.catalogStream$, { initialValue: [] });

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
      
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            this.loadMore();
        }
      }, { rootMargin: '200px' });

      observer.observe(this.sentinel.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  onFilterChange() {
     this.currentPage.set(1);
     this.hasMoreItems.set(true);
     this.searchTrigger$.next({ replace: true });
  }

  private getNumericFilters() {
    const filters: any = {};
    if (this.selectedGenres().length > 0) {
      filters.genres = this.selectedGenres().map((id: string|number) => Number(id)).filter((n: number) => !isNaN(n));
    }
    if (this.selectedYears().length > 0) {
      filters.years = this.selectedYears().map((id: string|number) => Number(id)).filter((n: number) => !isNaN(n));
    }
    if (this.selectedCountries().length > 0) {
      filters.countries = this.selectedCountries().map((id: string|number) => Number(id)).filter((n: number) => !isNaN(n));
    }
    return filters;
  }

  loadMore() {
    if (this.hasMoreItems() && !this.loading()) {
      this.currentPage.update((p: number) => p + 1);
      this.searchTrigger$.next({ replace: false });
    }
  }

  onMediaSelected(media: ApiMedia) {
    const url = this.mediaUrlPipe.transform(media);
    const segments = url.split('/').filter((s: string) => s !== '');
    this.router.navigate(['/', ...segments], { state: { media } });
  }
}
