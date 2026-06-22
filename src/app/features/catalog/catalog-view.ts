import { Component, ChangeDetectionStrategy, inject, signal, computed, DestroyRef, effect, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subject, switchMap, map, scan, tap, filter, catchError, of, merge } from 'rxjs';
import { CATALOG_GENRES, CATALOG_COUNTRIES, CATALOG_YEARS } from '../../core/constants/filter-config';
import { FilterDropdownComponent } from '@shared/components/filter-dropdown/filter-dropdown';
import { WpMediaService } from '@services/wp-media';
import { MediaGridComponent } from '@shared/components/media-grid/media-grid';
import { ApiMedia } from '@models';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';

interface CatalogQuery {
  type: string;
  page: number;
  filters: { genres: (string|number)[]; countries: (string|number)[]; years: (string|number)[] };
  replace: boolean;
}

@Component({
  selector: 'df-catalog-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MediaGridComponent, FormsModule, FilterDropdownComponent],
  providers: [MediaUrlPipe],
  template: `
    <div class="max-w-400 mx-auto px-4 md:px-8 pt-8 pb-24 md:mt-8 min-h-[70vh]">

      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <h1 class="text-3xl md:text-5xl font-black capitalize flex items-center gap-3">
          {{ pageTitle() }}
        </h1>

        <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <df-filter-dropdown
            title="Género"
            searchPlaceholder="Buscar género..."
            [options]="genres"
            [(selected)]="selectedGenres" />

          <df-filter-dropdown
            title="País"
            searchPlaceholder="Buscar país..."
            [options]="countries"
            [(selected)]="selectedCountries" />

          <df-filter-dropdown
            title="Año"
            searchPlaceholder="Buscar año..."
            [options]="years"
            [(selected)]="selectedYears" />
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
          <div class="mt-20 mb-12 flex flex-col items-center justify-center gap-6">
            @if (hasMoreItems() || loading()) {
               <button
                 type="button"
                 [disabled]="loading()"
                 class="group relative px-12 py-4 bg-linear-to-r from-[#e50914] to-[#b80811] hover:from-[#f60b16] hover:to-[#d60a12] active:scale-95 disabled:opacity-75 disabled:pointer-events-none text-white font-black tracking-widest text-sm rounded-full transition-all duration-300 shadow-[0_8px_30px_rgba(229,9,20,0.3)] hover:shadow-[0_12px_40px_rgba(229,9,20,0.5)] cursor-pointer flex items-center justify-center gap-3 select-none"
                 (click)="loadMore()">
                 @if (loading()) {
                   <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                     <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   <span>CARGANDO...</span>
                 } @else {
                   <span>CARGAR MÁS</span>
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                   </svg>
                 }
               </button>
            } @else {
               <div class="py-4 px-10 bg-[#141414] border border-white/10 rounded-full shadow-2xl">
                 <p class="text-gray-400 text-sm font-semibold tracking-wider uppercase text-center">Has llegado al final del catálogo</p>
               </div>
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
  private destroyRef = inject(DestroyRef);

  genres = CATALOG_GENRES;
  countries = CATALOG_COUNTRIES;
  years = CATALOG_YEARS;

  currentType = signal<string>('peliculas');
  currentPage = signal<number>(1);
  loading = signal<boolean>(false);
  hasMoreItems = signal<boolean>(true);

  selectedGenres = signal<Array<string|number>>([]);
  selectedCountries = signal<Array<string|number>>([]);
  selectedYears = signal<Array<string|number>>([]);

  // Subject que emite cada vez que los filtros cambian
  private filterChanged$ = new Subject<CatalogQuery>();

  constructor() {
    // effect() se re-ejecuta cada vez que CUALQUIER signal leído cambia
    effect(() => {
      const type      = this.currentType();
      const genres    = this.selectedGenres();
      const countries = this.selectedCountries();
      const years     = this.selectedYears();

      untracked(() => {
        this.currentPage.set(1);
        this.hasMoreItems.set(true);
        this.filterChanged$.next({
          type,
          page: 1,
          filters: { genres, countries, years },
          replace: true
        });
      });
    }, { allowSignalWrites: true });

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const paramSlug = params.get('catalogType') || 'peliculas';
        if (paramSlug !== this.currentType()) {
          this.currentType.set(paramSlug);
          this.selectedGenres.set([]);
          this.selectedYears.set([]);
          this.selectedCountries.set([]);
        }
      });
  }

  // Subject para paginación "Cargar más"
  private loadMorePage$ = new Subject<number>();

  // Stream de paginación: solo "cargar más"
  private paginationQuery$ = this.loadMorePage$.pipe(
    map((page): CatalogQuery => ({
      type: this.currentType(),
      page,
      filters: {
        genres: this.selectedGenres(),
        countries: this.selectedCountries(),
        years: this.selectedYears()
      },
      replace: false
    }))
  );

  // Merge ambos streams
  private catalogStream$ = merge(this.filterChanged$, this.paginationQuery$).pipe(
    tap(() => setTimeout(() => this.loading.set(true))),
    switchMap(query => {
      const cleanFilters: any = {};
      if (query.filters.genres.length > 0) {
        cleanFilters.genres = query.filters.genres.map((id: string|number) => Number(id)).filter((n: number) => !isNaN(n));
      }
      if (query.filters.years.length > 0) {
        cleanFilters.years = query.filters.years.map((id: string|number) => Number(id)).filter((n: number) => !isNaN(n));
      }
      if (query.filters.countries.length > 0) {
        cleanFilters.countries = query.filters.countries.map((id: string|number) => Number(id)).filter((n: number) => !isNaN(n));
      }

      return this.wpService.getPagedCatalog(query.type, query.page, cleanFilters).pipe(
        map(response => ({ response, replace: query.replace })),
        catchError(() => {
          setTimeout(() => this.loading.set(false));
          return of(null);
        })
      );
    }),
    filter((data): data is { response: { posts: ApiMedia[]; hasMore: boolean }; replace: boolean } => data !== null),
    tap(data => {
      setTimeout(() => {
        this.hasMoreItems.set(data.response.hasMore);
        this.loading.set(false);
      });
    }),
    scan((acc: ApiMedia[], curr) => {
      if (curr.replace) return curr.response.posts;
      return [...acc, ...curr.response.posts];
    }, [] as ApiMedia[])
  );

  items = toSignal(this.catalogStream$, { initialValue: [] });

  pageTitle = computed(() => {
    const t = this.currentType();
    if (t === 'movies' || t === 'peliculas') return 'Películas de Estreno';
    if (t === 'tvshows' || t === 'series') return 'Series de TV';
    if (t === 'animes') return 'Animes Exclusivos';
    return 'Catálogo en Línea';
  });

  loadMore() {
    if (this.hasMoreItems() && !this.loading()) {
      this.currentPage.update((p: number) => p + 1);
      this.loadMorePage$.next(this.currentPage());
    }
  }

  onMediaSelected(media: ApiMedia) {
    const url = this.mediaUrlPipe.transform(media);
    const segments = url.split('/').filter((s: string) => s !== '');
    this.router.navigate(['/', ...segments], { state: { media } });
  }
}
