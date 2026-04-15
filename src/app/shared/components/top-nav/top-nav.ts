import { ChangeDetectionStrategy, Component, signal, inject, ElementRef, ViewChild, computed } from '@angular/core';
import { toObservable, toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { WpMediaService } from '@services/wp-media';
import { SearchHistoryService } from '@services/search-history';
import { ProfileService } from '@services/profile';
import { PROFILE_ICON_PATHS, ProfileIconKey } from '@core/models/profile-icons';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';
import { WpImagePipe } from '@shared/pipes/wp-image';

@Component({
  selector: 'df-top-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FormsModule, MediaUrlPipe, WpImagePipe],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-100 transition-all duration-300"
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
          <img src="/images/logo/dark-flix.png" alt="DarkFlix" class="h-9 md:h-12 object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
        </a>

        <!-- Desktop Global Navigation -->
        <div class="hidden lg:flex items-center gap-6 ml-10 flex-1 text-sm font-medium text-gray-400">
           <a routerLink="/" routerLinkActive="font-bold text-white drop-shadow-md" [routerLinkActiveOptions]="{exact: true}" class="hover:text-white transition-all cursor-pointer">Inicio</a>
          <a routerLink="/series" routerLinkActive="font-bold text-white drop-shadow-md" class="hover:text-white transition-all cursor-pointer">Series</a>
          <a routerLink="/movies" routerLinkActive="font-bold text-white drop-shadow-md" class="hover:text-white transition-all cursor-pointer">Películas</a>
          <a routerLink="/animes" routerLinkActive="font-bold text-white drop-shadow-md" class="hover:text-white transition-all cursor-pointer">Animes</a>
          <a routerLink="/mi-lista" routerLinkActive="font-bold text-white drop-shadow-md" class="hover:text-white transition-all cursor-pointer">Mi Lista</a>
        </div>

        <!-- Right Side: Search & Profile -->
        <div class="flex items-center gap-4 md:gap-6 ml-auto relative">

          <!-- Lupa Trigger (Botón de Búsqueda Fijo) -->
          <div class="flex items-center justify-end">
               <svg xmlns="http://www.w3.org/2000/svg"
                    (click)="toggleSearch()"
                    fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
                    class="w-6 h-6 md:w-7 md:h-7 text-white cursor-pointer hover:text-[#e50914] transition-colors drop-shadow-md hover:scale-110">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
               </svg>
          </div>

          <!-- Avatar del Perfil Activo -->
          @if (profileService.activeProfile(); as profile) {
            <div class="relative">
              <button (click)="profileMenuOpen.update(v => !v)"
                      class="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-white transition-all"
                      [style.background-color]="profile.color + '33'">
                <svg viewBox="0 0 256 256" class="w-5 h-5" [style.fill]="profile.color">
                  <path [attr.d]="getProfileIconPath(profile.avatar)" />
                </svg>
              </button>

              @if (profileMenuOpen()) {
                <div class="absolute right-0 top-12 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl w-48 py-2 z-50 animate-fade-in">
                  <div class="px-4 py-2 border-b border-white/10 mb-1">
                    <p class="text-white font-bold text-sm">{{ profile.name }}</p>
                    <p class="text-gray-500 text-xs">Perfil activo</p>
                  </div>
                  <button (click)="changeProfile()" class="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Cambiar Perfil
                  </button>
                </div>
              }
            </div>
          }
        </div>

      </div>
    </nav>

    <!-- FULL SCREEN BLUR SEARCH OVERLAY -->
    @if (isSearchActive()) {
      <div class="fixed inset-0 z-100 bg-black/80 backdrop-blur-3xl flex flex-col pt-12 md:pt-20 px-4 md:px-24 text-white animate-fade-in overflow-hidden">

        <!-- Controles Superiores del Modal -->
        <div class="flex justify-between items-center mb-6">
           <h2 class="text-[#e50914] font-black tracking-widest text-lg md:text-xl uppercase drop-shadow-[0_0_10px_rgba(229,9,20,0.8)]">Búsqueda Global</h2>
           <button (click)="forceHideSearch()" class="bg-white/5 hover:bg-[#e50914] transition-colors rounded-full p-2 md:p-3 border border-white/10 hover:scale-110 hover:border-[#e50914] cursor-pointer shadow-xl">
             <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        <!-- Input Gigante -->
        <div class="relative w-full max-w-5xl mx-auto">
          <input #searchInput
                 type="text"
                 [(ngModel)]="searchQuery"
                 (ngModelChange)="onSearchInput($event)"
                 (keydown.enter)="handleEnterSearch()"
                 placeholder="¿Qué te gustaría ver hoy?"
                 class="w-full bg-transparent border-b-2 border-white/20 focus:border-[#e50914] text-white text-3xl md:text-5xl outline-none py-4 md:py-6 font-black placeholder-white/30 transition-colors drop-shadow-lg">

          @if (isSearching()) {
            <div class="absolute right-4 bottom-6 animate-spin rounded-full h-8 w-8 border-t-4 border-[#e50914] border-r-transparent"></div>
          }
        </div>

          <!-- Búsquedas Recientes (solo si el campo está vacío) -->
          @if (!searchQuery() && searchHistoryService.history().length > 0) {
            <div class="w-full max-w-5xl mx-auto mt-6">
              <div class="flex items-center justify-between mb-3">
                <span class="text-gray-400 text-xs font-bold uppercase tracking-widest">Búsquedas recientes</span>
                <button (click)="searchHistoryService.clear()" class="text-gray-500 hover:text-white text-xs transition-colors cursor-pointer">Limpiar</button>
              </div>
              <div class="flex flex-wrap gap-2">
                @for (q of searchHistoryService.history(); track q) {
                  <button (click)="onSearchInput(q)"
                          class="flex items-center gap-2 bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 text-sm font-medium px-4 py-2 rounded-full transition-all cursor-pointer group">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ q }}
                    <span (click)="$event.stopPropagation(); searchHistoryService.remove(q)"
                          class="ml-1 text-gray-600 group-hover:text-gray-300 transition-colors">✕</span>
                  </button>
                }
              </div>
            </div>
          }

          <!-- Resultados en Modal -->
        <div class="flex-1 mt-8 w-full max-w-7xl mx-auto overflow-y-auto hide-scrollbar pb-32">
          @if (searchQuery() && !isSearching() && searchResults().length === 0) {
            <div class="flex flex-col items-center justify-center mt-20 text-white/50">
               <p class="text-xl md:text-3xl font-bold">Sin resultados para "{{ searchQuery() }}"</p>
               <p class="mt-2 text-sm md:text-base font-medium">Intenta usar otras palabras o verifica tu ortografía.</p>
            </div>
          } @else if (searchResults().length > 0) {
            <div class="flex items-center gap-2 mb-6 text-gray-400 font-medium px-2">
               <div class="w-6 h-1 bg-[#e50914] rounded-full"></div>
               <span class="tracking-widest uppercase text-xs mx-auto md:text-sm">Explorando {{ searchTotal() }} títulos</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-2">
              @for (res of searchResults(); track res._id) {
                <a [routerLink]="res | mediaUrl" (click)="forceHideSearch()" class="flex flex-col gap-2 group cursor-pointer animate-fade-in">
                   <div class="relative aspect-poster rounded-lg overflow-hidden border border-white/10 shadow-lg group-hover:shadow-[0_10px_30px_rgba(229,9,20,0.4)] transition-all group-hover:scale-105 group-hover:border-[#e50914]/50">
                     <img [src]="res | wpImage:'poster'" class="w-full h-full object-cover">
                     <div class="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/90 to-transparent z-20">
                       <p class="text-white text-xs font-bold truncate group-hover:text-[#e50914] transition-colors">{{res.title}}</p>
                       <p class="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">{{res.type === 'tvshows' ? 'Serie' : res.type === 'movies' ? 'Película' : 'Anime'}}</p>
                     </div>
                   </div>
                </a>
              }
            </div>
          }
        </div>
      </div>
    }
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
        return this.wpService.searchMedia(query, 12).pipe(
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

  public readonly searchHistoryService = inject(SearchHistoryService);
  public readonly profileService = inject(ProfileService);

  profileMenuOpen = signal(false);

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

  handleEnterSearch() {
    const q = this.searchQuery().trim();
    if (!q) return;

    this.forceHideSearch();
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  forceHideSearch() {
    // Guardar la búsqueda en historial si hay resultados
    const q = this.searchQuery().trim();
    if (q.length >= 2 && this.searchResults().length > 0) {
      this.searchHistoryService.add(q);
    }
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

  changeProfile(): void {
    this.profileMenuOpen.set(false);
    this.profileService.logout();
    this.router.navigate(['/profiles']);
  }

  getProfileIconPath(key: string): string {
    return PROFILE_ICON_PATHS[key as ProfileIconKey] ?? PROFILE_ICON_PATHS['user'];
  }
}
