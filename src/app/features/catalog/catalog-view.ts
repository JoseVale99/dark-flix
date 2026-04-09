import { Component, ChangeDetectionStrategy, inject, signal, effect, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CATALOG_GENRES, CATALOG_COUNTRIES, CATALOG_YEARS } from '../../core/constants/filter-config';
import { WpMediaService } from '@services/wp-media';
import { MediaGridComponent } from '@shared/components/media-grid/media-grid';
import { ApiMedia } from '@models';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';

@Component({
  selector: 'df-catalog-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MediaGridComponent, FormsModule],
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
          <div class="relative min-w-40 flex-1 md:flex-none group">
            <select [(ngModel)]="selectedGenre" (ngModelChange)="applyFilters()" class="w-full bg-black/40 backdrop-blur-md border border-white/10 text-white font-medium text-sm rounded-lg px-4 py-2.5 shadow-lg hover:bg-white/10 hover:border-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-df-accent focus:border-transparent cursor-pointer appearance-none">
               <option value="" class="bg-[#1c1c1c] text-white">Todos los Géneros</option>
               @for (g of genres; track g.id) {
                 <option [value]="g.id" class="bg-[#1c1c1c] text-gray-300 hover:text-white">{{g.name}}</option>
               }
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
          <div class="relative min-w-40 flex-1 md:flex-none group">
            <select [(ngModel)]="selectedYear" (ngModelChange)="applyFilters()" class="w-full bg-black/40 backdrop-blur-md border border-white/10 text-white font-medium text-sm rounded-lg px-4 py-2.5 shadow-lg hover:bg-white/10 hover:border-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-df-accent focus:border-transparent cursor-pointer appearance-none">
               <option value="" class="bg-[#1c1c1c] text-white">Años de Estreno</option>
               @for (y of years; track y.id) {
                 <option [value]="y.id" class="bg-[#1c1c1c] text-gray-300 hover:text-white">{{y.name}}</option>
               }
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
          <div class="relative min-w-40 flex-1 md:flex-none group">
            <select [(ngModel)]="selectedCountry" (ngModelChange)="applyFilters()" class="w-full bg-black/40 backdrop-blur-md border border-white/10 text-white font-medium text-sm rounded-lg px-4 py-2.5 shadow-lg hover:bg-white/10 hover:border-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-df-accent focus:border-transparent cursor-pointer appearance-none">
               <option value="" class="bg-[#1c1c1c] text-white">Todos los Países</option>
               @for (c of countries; track c.id) {
                 <option [value]="c.id" class="bg-[#1c1c1c] text-gray-300 hover:text-white">{{c.name}}</option>
               }
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
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

  // Active Filters
  selectedGenre = signal<string>('');
  selectedCountry = signal<string>('');
  selectedYear = signal<string>('');

  pageTitle = computed(() => {
     const t = this.currentType();
     if (t === 'movies' || t === 'peliculas') return 'Películas de Estreno';
     if (t === 'tvshows' || t === 'series') return 'Series de TV';
     if (t === 'animes') return 'Animes Exclusivos';
     return 'Catálogo en Línea';
  });

  constructor() {
    // Load initial query params
    const qParams = this.route.snapshot.queryParamMap;
    if (qParams.has('genre')) this.selectedGenre.set(qParams.get('genre')!);
    if (qParams.has('year')) this.selectedYear.set(qParams.get('year')!);
    if (qParams.has('country')) this.selectedCountry.set(qParams.get('country')!);

    // Escuchar activamente los cambios de ruta principal
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const paramSlug = params.get('catalogType');
      if (paramSlug) {
        if (paramSlug !== this.currentType()) { // Only reset filters if switching category (e.g., from movies to series)
           this.selectedGenre.set('');
           this.selectedYear.set('');
           this.selectedCountry.set('');
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
           genre: this.selectedGenre() || null,
           year: this.selectedYear() || null,
           country: this.selectedCountry() || null
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
    if (this.selectedGenre()) filterObject.genres = [this.selectedGenre()];
    if (this.selectedYear()) filterObject.years = [this.selectedYear()];
    if (this.selectedCountry()) filterObject.countries = [this.selectedCountry()];

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
