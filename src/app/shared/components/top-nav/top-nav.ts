import { ChangeDetectionStrategy, Component, signal, inject, ElementRef, ViewChild, computed } from '@angular/core';
import { toObservable, toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { WpMediaService } from '@services/wp-media';
import { ApiMedia } from '@models';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';
import { WpImagePipe } from '@shared/pipes/wp-image';

@Component({
  selector: 'df-top-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, MediaUrlPipe, WpImagePipe],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
         [class.bg-[#141414]]="isScrolled() || isSearchActive()"
         [class.shadow-lg]="isScrolled() || isSearchActive()"
         [class.py-4]="!isScrolled() && !isSearchActive()"
         [class.py-2]="isScrolled() || isSearchActive()"
         [class.bg-gradient-to-b]="!isScrolled() && !isSearchActive()"
         [class.from-black]="!isScrolled() && !isSearchActive()"
         [class.to-transparent]="!isScrolled() && !isSearchActive()">

      <div class="max-w-400 mx-auto px-4 md:px-8 flex items-center justify-between">

        <!-- Logo -->
        <a routerLink="/" class="flex flex-col select-none cursor-pointer group">
          <h1 class="text-2xl md:text-3xl font-black tracking-tighter" style="font-family: 'Outfit', sans-serif;">
            <span class="text-white group-hover:text-gray-300 transition-colors">DARK</span><span class="text-[#e50914]">FLIX</span>
          </h1>
        </a>

        <!-- Desktop Global Navigation -->
        <div class="hidden lg:flex items-center gap-6 ml-10 flex-1 text-sm font-semibold text-gray-300">
           <a routerLink="/" class="hover:text-white transition-colors cursor-pointer">Inicio</a>
          <a routerLink="/series" class="hover:text-white transition-colors cursor-pointer">Series</a>
          <a routerLink="/movies" class="hover:text-white transition-colors cursor-pointer">Películas</a>
          <a routerLink="/animes" class="hover:text-white transition-colors cursor-pointer">Animes</a>
          <a routerLink="/mi-lista" class="hover:text-white transition-colors cursor-pointer">Mi Lista</a>
        </div>

        <!-- Right Side: Search & Profile -->
        <div class="flex items-center gap-4 md:gap-6 ml-auto relative">

          <!-- Lupa Animada y Buscador Netflix Style -->
          <div class="relative flex items-center justify-end transition-all duration-300 ease-in-out"
               [class.w-10]="!isSearchActive()"
               [class.w-full]="isSearchActive()"
               [class.sm:w-[350px]]="isSearchActive()">

               <svg xmlns="http://www.w3.org/2000/svg"
                    (click)="toggleSearch()"
                    fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
                    class="w-6 h-6 text-white cursor-pointer absolute right-2 z-10 hover:text-gray-300 transition-colors">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
               </svg>

               <input #searchInput
                      type="text"
                      [(ngModel)]="searchQuery"
                      (ngModelChange)="onSearchInput($event)"
                      (blur)="onSearchBlur()"
                      [class.opacity-0]="!isSearchActive()"
                      [class.pointer-events-none]="!isSearchActive()"
                      [class.opacity-100]="isSearchActive()"
                      placeholder="Películas, Series, Animes..."
                      class="pl-4 pr-12 py-2 border text-white outline-none w-full text-sm placeholder-gray-400 transition-all duration-300 shadow-xl"
                      [class.bg-transparent]="!isSearchActive()"
                      [class.border-transparent]="!isSearchActive()"
                      [class.bg-black]="isSearchActive()"
                      [class.border-white]="isSearchActive()">
          </div>

          <!-- Dropdown Popover Resultados -->
          @if (isSearchActive() && (searchResults().length > 0 || isSearching())) {
            <div class="absolute top-12 right-0 w-87.5 bg-[#141414] border border-white/10 rounded-b shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50">

              @if (isSearching()) {
                <div class="py-6 flex justify-center">
                   <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#e50914]"></div>
                </div>
              } @else {
                <h3 class="text-[11px] text-[#4ea0ea] font-bold px-4 pt-4 pb-2 border-b border-white/5 uppercase tracking-wider">
                  <svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-3 h-3 mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  Resultados ({{searchTotal()}})
                </h3>

                <div class="max-h-[60vh] overflow-y-auto">
                  @for (res of searchResults(); track res._id) {
                    <a [routerLink]="res | mediaUrl" (click)="forceHideSearch()" class="flex items-center gap-3 p-3 hover:bg-white/10 transition-colors cursor-pointer border-b border-white/5 group">
                       <img [src]="res | wpImage:'poster'" class="w-12 h-16 object-cover rounded opacity-90 group-hover:opacity-100">
                       <div class="flex-1 min-w-0">
                         <h4 class="text-white font-bold text-sm truncate">{{res.title}}</h4>
                         <span class="text-xs text-gray-400 capitalize">{{res.type === 'tvshows' ? 'Serie' : res.type === 'movies' ? 'Película' : 'Anime'}}</span>
                       </div>
                    </a>
                  }
                </div>

                <!-- Botón de ir a ver todos en la cuadrícula de búsqueda base -->
                <a routerLink="/search" [queryParams]="{q: searchQuery()}" (click)="forceHideSearch()" class="block w-full py-3 text-center text-sm font-bold text-white bg-[#e50914] hover:bg-red-700 transition-colors cursor-pointer">
                  Ver todos los resultados
                </a>
              }
            </div>
          }
        </div>

      </div>
    </nav>
  `
})
export class TopNavComponent {
  private router = inject(Router);
  private wpService = inject(WpMediaService);

  isScrolled = signal(false);
  isSearchActive = signal(false);
  searchQuery = signal('');
  isSearching = signal(false);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Flujo Reactivo Puro (Zoneless Best Practice) usando Signals interoperables
  private searchState = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => this.isSearching.set(true)),
      switchMap(query => {
        if (!query.trim()) {
           this.isSearching.set(false);
           return of({posts: [], total: 0});
        }
        return this.wpService.searchMedia(query, 3).pipe(
          tap(() => this.isSearching.set(false)),
          catchError(() => {
            this.isSearching.set(false);
            return of({posts: [], total: 0});
          })
        );
      })
    ),
    { initialValue: {posts: [], total: 0} }
  );

  // Computed signals derivados
  searchResults = computed(() => this.searchState().posts);
  searchTotal = computed(() => this.searchState().total);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 0);
      });
    }

    // Usamos takeUntilDestroyed para auto-limpiar la memoria del Router sin usar OnDestroy
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => this.forceHideSearch());
  }

  toggleSearch() {
    this.isSearchActive.update(v => !v);
    if (this.isSearchActive()) {
      setTimeout(() => this.searchInput.nativeElement.focus(), 100);
    } else {
      this.forceHideSearch();
    }
  }

  onSearchInput(query: string) {
    this.searchQuery.set(query);
  }

  forceHideSearch() {
    this.isSearchActive.set(false);
    this.searchQuery.set('');
    this.isSearching.set(false);
  }

  onSearchBlur() {
    setTimeout(() => {
      if (this.searchQuery().trim() === '') {
        this.forceHideSearch();
      }
    }, 200);
  }
}
