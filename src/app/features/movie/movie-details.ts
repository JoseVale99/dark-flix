import { Component, ChangeDetectionStrategy, inject, input, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WpMediaService } from '@services/wp-media';
import { ApiMedia } from '@models';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { LazyImageDirective } from '@shared/directives/lazy-image';
import { WpImagePipe } from '@shared/pipes/wp-image';
import { BadgeComponent } from '@shared/components/badge/badge';
import { Location } from '@angular/common';
import { SafePipe } from '@shared/pipes/safe';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'df-movie-details',
  template: `
    <div class="min-h-screen w-full bg-df-background pb-20 overflow-x-hidden relative">
      @if (loadingOrPending()) {
        <div class="w-full h-[60vh] bg-df-card animate-pulse"></div>
        <div class="p-4 md:p-12 space-y-4 max-w-4xl mx-auto">
          <div class="h-10 bg-df-card w-2/3 rounded"></div>
          <div class="h-4 bg-df-card w-full rounded"></div>
          <div class="h-4 bg-df-card w-5/6 rounded"></div>
        </div>
      } @else if (hasError()) {
        <div class="flex flex-col items-center justify-center h-screen text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="font-semibold text-xl">Archivo dañado o no encontrado</p>
          <button (click)="goBack()" class="mt-6 text-df-accent hover:text-white transition-colors underline">
            Regresar al Inicio
          </button>
        </div>
      } @else if (movie()) {
        <!-- CAPA DE FONDO: Backdrop Absoluto Cinemático -->
        <div class="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none">
          
          <!-- Capa 1: Fondo escenográfico súper borroso (Proyección de luz) -->
          <img dfLazyImage [lazySrc]="movie()! | wpImage:'backdrop'" class="absolute inset-0 w-full h-[150%] object-cover z-0 blur-[90px] opacity-40 mix-blend-screen" alt="Atmosphere">
          
          <!-- Capa 2: Backdrop estirado con máscara Tailwind v4 nativa -->
          <div class="absolute top-0 right-0 w-full md:w-[80%] h-[85vh] z-10 flex justify-end opacity-60 md:mask-[linear-gradient(to_right,transparent,black_20%)] mask-[linear-gradient(to_bottom,black_10%,transparent_90%)]">
            <img dfLazyImage [lazySrc]="movie()! | wpImage:'backdrop'" class="w-full h-full object-cover md:object-right object-top" alt="Backdrop">
          </div>

          <!-- Capa 3: "Humo" (Smoke Fades) usando densidad paralela -->
          <div class="absolute inset-0 bg-black/10 z-10"></div> <!-- Oscurecedor unificador ligero -->
          
          <!-- Base sólida inferior para evitar cualquier corte -->
          <div class="absolute inset-x-0 bottom-0 h-[20vh] bg-df-background z-20"></div>
          
          <!-- Humo denso ascendente -->
          <div class="absolute inset-x-0 bottom-[10vh] h-[70vh] bg-linear-to-t from-df-background from-20% via-df-background/80 to-transparent z-20"></div>
          
          <!-- Sombra profunda interior adicional -->
          <div class="absolute inset-0 bg-linear-to-t from-df-background via-transparent to-transparent z-20 opacity-80"></div>

          <!-- Gradiente horizontal (para oscurecer la zona de texto) -->
          <div class="absolute inset-y-0 left-0 w-full md:w-3/5 bg-linear-to-r from-df-background from-15% via-df-background/80 to-transparent z-20"></div>
        </div>

        <!-- Botón Volver -->
        <button (click)="goBack()" class="absolute top-6 left-4 md:left-12 z-50 text-white/80 hover:text-white bg-df-background/50 hover:bg-[#e50914] rounded-full p-3 backdrop-blur-md transition-all duration-300 focus:outline-none hover:scale-110 shadow-lg border border-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <!-- CONTENIDO PRINCIPAL FLOTANTE -->
        <div class="relative z-30 pt-[35vh] md:pt-[40vh] px-4 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 pb-12">
          
          <!-- Left Column: Poster -->
          <div class="hidden md:block w-1/4 shrink-0">
            <div class="aspect-poster rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden border border-white/5 ring-1 ring-white/10 group">
              <img dfLazyImage [lazySrc]="movie()! | wpImage:'poster'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Poster">
            </div>
          </div>

          <!-- Right Column: Info -->
          <div class="flex-1 pt-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <div class="flex flex-wrap gap-2 mb-4">
              @if (getQuality()) { <df-badge [text]="getQuality()!" variant="accent" /> }
              @if (getYear()) { <df-badge [text]="getYear()!" variant="default" /> }
              <df-badge text="Cinematic" variant="default" />
              @if (movie()?.runtime && movie()?.runtime !== '0.0') {
                <df-badge [text]="movie()!.runtime + ' min'" variant="default" />
              }
              @if (movie()?.rating && movie()?.rating !== '0.0') {
                <div class="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-sm font-bold text-yellow-400 border border-white/5 backdrop-blur-sm shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {{ movie()!.rating }}
                </div>
              }
            </div>

            <h1 class="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-2 text-balance text-white"
                [innerHTML]="movie()!.title">
            </h1>
            
            @if (movie()?.original_title && movie()!.original_title !== movie()!.title) {
              <p class="text-gray-400 font-medium mb-4 italic" [innerHTML]="movie()!.original_title"></p>
            }

            @if (movie()?.tagline) {
              <p class="text-df-accent font-bold uppercase tracking-widest text-sm mb-6">{{ movie()!.tagline }}</p>
            } @else {
              <div class="mb-6"></div>
            }

            <div class="prose prose-invert prose-lg text-gray-300 mb-8 max-w-3xl leading-relaxed drop-shadow-md"
                 [innerHTML]="movie()!.overview">
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
              <!-- Reemplazado por el nuevo componente inferior -->
              <button (click)="activeTab.set('REPRODUCIR')" class="bg-[#e50914] hover:bg-red-700 text-white font-bold py-3 px-8 rounded flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(229,9,20,0.5)] active:scale-95 text-center text-lg w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 shrink-0">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                VER AHORA
              </button>
            </div>
          </div>
          
        </div>

        <!-- LOWER SECTION (TABS) -->
        <div class="mt-8 w-full max-w-7xl mx-auto px-4 md:px-12 relative z-30 pb-20">
          
          <!-- TABS MENU -->
          <div class="flex gap-6 border-b border-white/10 pb-0 overflow-x-auto hide-scrollbar mb-8">
            <button (click)="activeTab.set('REPRODUCIR')" 
                    [class.text-white]="activeTab() === 'REPRODUCIR'" 
                    [class.border-[#e50914]]="activeTab() === 'REPRODUCIR'" 
                    [class.border-transparent]="activeTab() !== 'REPRODUCIR'"
                    class="text-gray-400 hover:text-white font-bold tracking-wider pb-3 border-b-2 whitespace-nowrap transition-colors uppercase text-sm">
              Reproductor en línea
            </button>
            <button (click)="activeTab.set('DESCARGAS')" 
                    [class.text-white]="activeTab() === 'DESCARGAS'" 
                    [class.border-[#e50914]]="activeTab() === 'DESCARGAS'" 
                    [class.border-transparent]="activeTab() !== 'DESCARGAS'"
                    class="text-gray-400 hover:text-white font-bold tracking-wider pb-3 border-b-2 whitespace-nowrap transition-colors uppercase text-sm">
              Descargas
            </button>
            <button (click)="activeTab.set('REPARTO')" 
                    [class.text-white]="activeTab() === 'REPARTO'" 
                    [class.border-[#e50914]]="activeTab() === 'REPARTO'" 
                    [class.border-transparent]="activeTab() !== 'REPARTO'"
                    class="text-gray-400 hover:text-white font-bold tracking-wider pb-3 border-b-2 whitespace-nowrap transition-colors uppercase text-sm">
              Reparto
            </button>
            <button (click)="activeTab.set('SIMILARES')" 
                    [class.text-white]="activeTab() === 'SIMILARES'" 
                    [class.border-[#e50914]]="activeTab() === 'SIMILARES'" 
                    [class.border-transparent]="activeTab() !== 'SIMILARES'"
                    class="text-gray-400 hover:text-white font-bold tracking-wider pb-3 border-b-2 whitespace-nowrap transition-colors uppercase text-sm">
              Títulos Similares
            </button>
          </div>

          <!-- TAB CONTENT RENDERER -->
          <div class="min-h-100">
            @switch (activeTab()) {
              
              @case ('REPRODUCIR') {
                <div class="animate-fade-in flex flex-col gap-4">
                  @if (playersState().embeds.length === 0) {
                    <div class="text-gray-400 min-h-75 flex items-center justify-center border border-white/5 rounded-xl bg-black/20">
                      Buscando enlaces de reproducción...
                    </div>
                  } @else {
                    <!-- Iframe Container -->
                    <div class="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative border border-white/10">
                      @if (currentEmbed()) {
                        <iframe [src]="currentEmbed()!.url | safe:'resourceUrl'" class="absolute inset-0 w-full h-full" allowfullscreen></iframe>
                      }
                    </div>
                    
                    <!-- Server Selector -->
                    <div class="flex flex-wrap gap-2 mt-4 items-center">
                      <span class="text-sm font-semibold text-gray-400 uppercase tracking-widest mr-2">Servidor:</span>
                      @for (embed of playersState().embeds; track $index) {
                        <button (click)="selectedEmbedIndex.set($index)"
                                [class.bg-white]="selectedEmbedIndex() === $index"
                                [class.text-black]="selectedEmbedIndex() === $index"
                                [class.bg-white/10]="selectedEmbedIndex() !== $index"
                                [class.text-white]="selectedEmbedIndex() !== $index"
                                class="px-4 py-2 rounded-md text-sm font-medium hover:bg-white/30 transition-colors border border-white/5">
                          {{ embed.server || 'Server ' + ($index + 1) }} - {{ embed.lang }} ({{ embed.quality }})
                        </button>
                      }
                    </div>
                  }
                </div>
              }

              @case ('DESCARGAS') {
                <div class="animate-fade-in">
                  @if (downloadsState().length === 0) {
                    <div class="text-gray-400">Verificando descargas disponibles...</div>
                  } @else {
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      @for (dl of downloadsState(); track $index) {
                        <a [href]="dl.url" target="_blank" class="flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors group">
                          <div class="flex justify-between items-start mb-4">
                            <span class="text-lg font-bold text-white group-hover:text-[#e50914] transition-colors line-clamp-1 break-all">{{ dl.url.split('/')[2] }}</span>
                            <df-badge [text]="dl.quality" variant="accent" />
                          </div>
                          <div class="space-y-2 mt-auto text-sm text-gray-300">
                            <div class="flex justify-between"><span>Audio:</span> <span class="text-white">{{ dl.lang }}</span></div>
                            @if (dl.size) { <div class="flex justify-between"><span>Peso:</span> <span class="text-white">{{ dl.size }}</span></div> }
                            @if (dl.format) { <div class="flex justify-between"><span>Formato:</span> <span class="text-white">{{ dl.format }}</span></div> }
                          </div>
                        </a>
                      }
                    </div>
                  }
                </div>
              }

              @case ('REPARTO') {
                <div class="animate-fade-in">
                  @if (castState().length === 0) {
                    <div class="text-gray-400">Cargando reparto...</div>
                  } @else {
                    <div class="flex overflow-x-auto gap-4 md:gap-6 pb-6 hide-scrollbar snap-x">
                      @for (actor of castState(); track actor.term_id) {
                        <div class="flex flex-col items-center shrink-0 w-30 md:w-37.5 snap-center">
                          <div class="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 border-2 border-white/10 bg-df-card relative">
                            <!-- Si la API provee path local, usualmente es de la base TMDB -->
                            @if (actor.meta?.profile_path; as path) {
                               <img [src]="'https://image.tmdb.org/t/p/w276_and_h350_face' + path" class="w-full h-full object-cover">
                            } @else {
                               <div class="w-full h-full flex items-center justify-center text-3xl font-bold text-white/20">{{ actor.term_name.charAt(0) }}</div>
                            }
                          </div>
                          <p class="text-white text-center font-semibold text-sm leading-tight mb-1">{{ actor.term_name }}</p>
                          <p class="text-gray-400 text-center text-xs leading-tight line-clamp-2">{{ actor.meta?.character || actor.dep }}</p>
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              @case ('SIMILARES') {
                <div class="animate-fade-in">
                  @if (relatedState().length === 0) {
                    <div class="text-gray-400">Buscando títulos relacionados...</div>
                  } @else {
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      @for (rel of relatedState(); track rel._id) {
                        <a [routerLink]="['/movie', rel._id]" class="block relative aspect-2/3 rounded-lg overflow-hidden group border border-white/5 bg-df-card">
                          <img [src]="rel | wpImage:'poster'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                            <p class="text-white text-center font-bold text-sm leading-tight border-b-2 border-[#e50914] pb-1">{{ rel.title }}</p>
                          </div>
                        </a>
                      }
                    </div>
                  }
                </div>
              }
            }
          </div>
        </div>

      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, LazyImageDirective, WpImagePipe, BadgeComponent, SafePipe]
})
export class MovieDetailsComponent {
  // Captured directly from the route param /movie/:id thanks to withComponentInputBinding()
  id = input.required<string>();

  private wpService = inject(WpMediaService);
  private location = inject(Location);
  
  // Custom View States
  activeTab = signal<'REPRODUCIR' | 'DESCARGAS' | 'REPARTO' | 'SIMILARES'>('REPRODUCIR');
  selectedEmbedIndex = signal<number>(0);

  // Router state
  private stateMedia = history.state.media as ApiMedia | undefined;

  // Derive an observable from the input 'id' and fetch the details IF state was empty
  private mediaState = toSignal(
    toObservable(this.id).pipe(
      switchMap(currentId => {
        // Register Hit Asynchronously
        this.wpService.registerHit(currentId).pipe(catchError(() => of(false))).subscribe();

        // Carga ultra rápida: si viene en el estado, úsalo!
        if (this.stateMedia && String(this.stateMedia._id) === currentId) {
            return of({ data: this.stateMedia, error: false });
        }
        // Fallback: Fetch (Hackstore might crash unless on page=1)
        return this.wpService.getMediaById(currentId).pipe(
            map(post => ({ data: post, error: false })),
            catchError(() => of({ data: null as ApiMedia | null, error: true }))
        );
      })
    ),
    { initialValue: this.stateMedia ? { data: this.stateMedia, error: false } : { data: null as ApiMedia | null, error: false } }
  );

  // Extended Data Signals (Non-blocking Parallel Fetching)
  playersState = toSignal(
    toObservable(this.id).pipe(
      switchMap(currentId => this.wpService.getMoviePlayers(currentId).pipe(catchError(() => of({ embeds: [], downloads: [] }))))
    ), { initialValue: { embeds: [], downloads: [] } }
  );

  downloadsState = toSignal(
    toObservable(this.id).pipe(
      switchMap(currentId => this.wpService.getMovieDownloads(currentId).pipe(catchError(() => of([]))))
    ), { initialValue: [] }
  );

  castState = toSignal(
    toObservable(this.id).pipe(
      switchMap(currentId => this.wpService.getMovieCast(currentId).pipe(catchError(() => of([]))))
    ), { initialValue: [] }
  );

  relatedState = toSignal(
    toObservable(this.id).pipe(
      switchMap(currentId => this.wpService.getRelatedMedia(currentId).pipe(catchError(() => of([]))))
    ), { initialValue: [] }
  );

  movie = computed(() => this.mediaState()?.data || null);
  hasError = computed(() => this.mediaState()?.error === true);
  loadingOrPending = computed(() => this.mediaState() === undefined && !this.hasError());

  currentEmbed = computed(() => {
    const embeds = this.playersState().embeds;
    if (!embeds.length) return null;
    return embeds[this.selectedEmbedIndex()] || embeds[0];
  });

  getQuality(): string | null {
    return this.movie()?.quality?.length ? 'HD' : null;
  }

  getYear(): string | null {
    const rd = this.movie()?.release_date;
    return rd ? rd.split('-')[0] : null;
  }

  goBack() {
    this.location.back();
  }
}

