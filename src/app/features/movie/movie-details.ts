import { Component, ChangeDetectionStrategy, inject, input, computed, signal, effect, ViewChild, untracked } from '@angular/core';
import { Title, Meta, DomSanitizer } from '@angular/platform-browser';
import { WpMediaService } from '@services/wp-media';
import { MyListService } from '@services/my-list';
import { WatchHistoryService } from '@services/watch-history';
import { ApiMedia } from '@models';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, combineLatest, filter, concat, delay, distinctUntilChanged, take } from 'rxjs';
import { LazyImageDirective } from '@shared/directives/lazy-image';
import { WpImagePipe } from '@shared/pipes/wp-image';
import { BadgeComponent } from '@shared/components/badge/badge';
import { Location } from '@angular/common';
import { SafePipe } from '@shared/pipes/safe';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';
import { IframeLoaderDirective } from '@shared/directives/iframe-loader';

@Component({
  selector: 'df-movie-details',
  template: `
    <div class="min-h-screen w-full bg-df-background pb-20 overflow-x-hidden relative">
      @if (loadingOrPending()) {
        <!-- Skeleton Cinematic Backdrop -->
        <div class="relative w-full h-[60vh] md:h-[85vh] bg-linear-to-r from-[#141414] via-[#202020] to-[#141414] bg-size-[200%_100%] animate-shimmer overflow-hidden">
           <div class="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-df-background to-transparent z-10"></div>
        </div>
        <!-- Skeleton Content Area -->
        <div class="relative z-30 -mt-32 md:-mt-48 px-4 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
           <!-- Poster Skeleton -->
           <div class="hidden md:block w-1/4 shrink-0 shadow-2xl">
              <div class="aspect-poster rounded-lg bg-linear-to-r from-[#18181b] via-[#27272a] to-[#18181b] bg-size-[200%_100%] animate-shimmer ring-1 ring-white/5"></div>
           </div>
           <!-- Info Skeleton -->
           <div class="flex-1 space-y-6 pt-4 w-full">
              <div class="h-10 md:h-14 bg-linear-to-r from-[#18181b] via-[#27272a] to-[#18181b] bg-size-[200%_100%] animate-shimmer rounded w-3/4"></div>
              <div class="flex gap-2">
                 <div class="h-6 w-16 bg-[#18181b] rounded animate-pulse"></div>
                 <div class="h-6 w-20 bg-[#18181b] rounded animate-pulse"></div>
              </div>
              <div class="space-y-3 max-w-3xl">
                 <div class="h-4 bg-linear-to-r from-[#18181b] via-[#27272a] to-[#18181b] bg-size-[200%_100%] animate-shimmer rounded w-full"></div>
                 <div class="h-4 bg-linear-to-r from-[#18181b] via-[#27272a] to-[#18181b] bg-size-[200%_100%] animate-shimmer rounded w-[90%]"></div>
                 <div class="h-4 bg-linear-to-r from-[#18181b] via-[#27272a] to-[#18181b] bg-size-[200%_100%] animate-shimmer rounded w-[80%]"></div>
              </div>
              <div class="h-12 w-40 bg-[#e50914]/20 rounded animate-pulse mt-8"></div>
           </div>
        </div>
      } @else if (hasError()) {
        <div class="flex flex-col items-center justify-center h-screen text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="font-semibold text-xl">Archivo dañado o no encontrado</p>
          <button (click)="goBack()" class="mt-6 text-df-accent hover:text-white transition-colors underline cursor-pointer">
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
        <button (click)="goBack()" class="absolute top-6 left-4 md:left-12 z-50 text-white/80 hover:text-white bg-df-background/50 hover:bg-[#e50914] rounded-full p-3 backdrop-blur-md transition-all duration-300 focus:outline-none hover:scale-110 shadow-lg border border-white/5 cursor-pointer">
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

            <div class="flex flex-col sm:flex-row gap-4 mt-6">
              <button (click)="playMedia()" class="bg-[#e50914] hover:bg-red-700 text-white font-bold py-3 px-8 rounded flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(229,9,20,0.5)] active:scale-95 text-center text-lg w-fit cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 shrink-0">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                VER AHORA
              </button>

              <button (click)="myListService.toggleList(movie()!)"
                      class="bg-black/40 hover:bg-black/60 border border-white/20 text-white font-bold py-3 px-6 rounded flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-xl text-center text-lg w-fit cursor-pointer">
                @if (myListService.isInList(movie()!._id)) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#e50914]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  En Mi Lista
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Mi Lista
                }
              </button>

              <!-- Botón Compartir (Web Share API) -->
              <button (click)="shareMovie()"
                      title="Compartir"
                      class="bg-black/40 hover:bg-black/60 border border-white/20 text-white font-bold py-3 px-5 rounded flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-xl cursor-pointer relative">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                @if (shareCopied()) {
                  <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap animate-fade-in">
                    ¡Copiado!
                  </span>
                }
              </button>

              @if (movie()?.trailer) {
                <button (click)="activeTab.set('TRAILER'); scrollToTabs()"
                        class="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-6 rounded flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-xl text-center text-lg w-fit cursor-pointer backdrop-blur-md">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  TRÁILER
                </button>
              }
            </div>
          </div>

        </div>

        <!-- COMPONENTES EXTENDIDOS (TABS: REPRODUCTORES, DESCARGAS, REPARTO...) -->
        @defer (on viewport; prefetch on idle) {
          <div class="max-w-7xl mx-auto px-6 pb-24 text-white relative z-30">

          <!-- TABS NAVIGATION SCROLLABLE ON MOBILE -->
          <div class="flex gap-6 md:gap-8 border-b border-white/10 mb-8 pt-8 overflow-x-auto hide-scrollbar snap-x w-full">
            @if (movie()?.type === 'tvshows' || movie()?.type === 'animes') {
              <button (click)="activeTab.set('EPISODIOS')"
                      [class.text-white]="activeTab() === 'EPISODIOS'"
                      [class.border-white]="activeTab() === 'EPISODIOS'"
                      class="shrink-0 snap-start whitespace-nowrap pb-3 font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 hover:text-white cursor-pointer"
                      [class.text-gray-400]="activeTab() !== 'EPISODIOS'"
                      [class.border-transparent]="activeTab() !== 'EPISODIOS'">
                EPISODIOS
              </button>
            }
            @if (movie()?.type === 'movies' || selectedEpisodeId()) {
              <button (click)="activeTab.set('REPRODUCIR')"
                      [class.text-white]="activeTab() === 'REPRODUCIR'"
                      [class.border-white]="activeTab() === 'REPRODUCIR'"
                      class="shrink-0 snap-start whitespace-nowrap pb-3 font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 hover:text-white cursor-pointer"
                      [class.text-gray-400]="activeTab() !== 'REPRODUCIR'"
                      [class.border-transparent]="activeTab() !== 'REPRODUCIR'">
                {{ (movie()?.type === 'tvshows' || movie()?.type === 'animes') ? 'VER EPISODIO' : 'REPRODUCTOR' }}
              </button>
            }
            <button (click)="activeTab.set('REPARTO')"
                    [class.text-white]="activeTab() === 'REPARTO'"
                    [class.border-white]="activeTab() === 'REPARTO'"
                    class="shrink-0 snap-start whitespace-nowrap pb-3 font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 hover:text-white cursor-pointer"
                    [class.text-gray-400]="activeTab() !== 'REPARTO'"
                    [class.border-transparent]="activeTab() !== 'REPARTO'">
              REPARTO
            </button>
            <button (click)="activeTab.set('GALERÍA')"
                    [class.text-white]="activeTab() === 'GALERÍA'"
                    [class.border-white]="activeTab() === 'GALERÍA'"
                    class="shrink-0 snap-start whitespace-nowrap pb-3 font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 hover:text-white cursor-pointer"
                    [class.text-gray-400]="activeTab() !== 'GALERÍA'"
                    [class.border-transparent]="activeTab() !== 'GALERÍA'">
              GALERÍA
            </button>
            <button (click)="activeTab.set('SIMILARES')"
                    [class.text-white]="activeTab() === 'SIMILARES'"
                    [class.border-white]="activeTab() === 'SIMILARES'"
                    class="shrink-0 snap-start whitespace-nowrap pb-3 font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 hover:text-white cursor-pointer"
                    [class.text-gray-400]="activeTab() !== 'SIMILARES'"
                    [class.border-transparent]="activeTab() !== 'SIMILARES'">
              SIMILARES
            </button>
            @if (movie()?.trailer) {
              <button (click)="activeTab.set('TRAILER')"
                      [class.text-white]="activeTab() === 'TRAILER'"
                      [class.border-white]="activeTab() === 'TRAILER'"
                      class="shrink-0 snap-start whitespace-nowrap pb-3 font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 hover:text-white cursor-pointer"
                      [class.text-gray-400]="activeTab() !== 'TRAILER'"
                      [class.border-transparent]="activeTab() !== 'TRAILER'">
                TRAILER
              </button>
            }
          </div>

          <!-- TABS CONTENT -->
          <div class="min-h-50">
            @switch (activeTab()) {

              @case ('EPISODIOS') {
                <div class="animate-fade-in max-w-5xl mx-auto flex flex-col gap-6">
                  <!-- Control de Temporada -->
                  <div class="flex justify-between items-center bg-[#161616] border border-white/5 py-3 px-6 rounded-xl">
                    <h2 class="text-white font-bold text-lg md:text-xl">Selecciona un Episodio</h2>
                    <div class="relative min-w-40">
                      <select [ngModel]="selectedSeason()" (ngModelChange)="selectedSeason.set($event)"
                              class="w-full bg-black border border-white/20 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:border-[#e50914] appearance-none cursor-pointer hover:bg-white/5 transition-colors">
                        @if (episodesResponse()?.seasons) {
                          @for (s of episodesResponse()!.seasons; track s) {
                            <option [value]="s">Temporada {{ s }}</option>
                          }
                        } @else {
                          <option value="1">Temporada 1</option>
                        }
                      </select>
                      <!-- Custom caret icon -->
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  <!-- Lista de Episodios -->
                  @if (!episodesResponse()?.posts) {
                    <div class="text-center py-10 text-gray-500 font-bold animate-pulse">Cargando episodios...</div>
                  } @else {
                    <div class="flex flex-col gap-3">
                      @for (ep of episodesResponse()!.posts; track ep._id) {
                        <button (click)="selectedEpisodeId.set(ep._id); activeTab.set('REPRODUCIR'); isTheaterMode.set(true)"
                                class="flex items-center gap-4 text-left p-4 md:p-5 bg-[#161616] hover:bg-white/10 border border-white/5 transition-colors rounded-xl group relative overflow-hidden cursor-pointer"
                                [class.border-[#e50914]]="selectedEpisodeId() === ep._id">

                          <!-- Número de capitulo gigante -->
                          <div class="text-4xl md:text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors mr-2 shrink-0">
                            {{ ep.episode_number }}
                          </div>

                          <div class="flex flex-col flex-1 z-10">
                            <h3 class="text-white font-bold text-base md:text-lg group-hover:text-[#e50914] transition-colors leading-tight">
                              {{ ep.title.split(': ').pop() || ep.title }}
                            </h3>
                            <p class="text-gray-500 text-xs md:text-sm font-medium mt-1">Temporada {{ ep.season_number }} • Episodio {{ ep.episode_number }}</p>
                          </div>

                          <!-- Play icon on hover -->
                          <div class="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center shrink-0 group-hover:bg-[#e50914] group-hover:border-[#e50914] transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </button>
                      }
                    </div>
                  }
                </div>
              }

              @case ('REPRODUCIR') {
                <div class="animate-fade-in flex flex-col gap-4">
                  @if (playersState().embeds.length === 0) {
                    <div class="text-gray-400 min-h-75 flex items-center justify-center border border-white/5 rounded-xl bg-black/20">
                      Buscando enlaces de reproducción...
                    </div>
                  } @else {
                    <!-- Iframe Container (solo visible cuando NO está en theater mode) -->
                    <div class="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative border border-white/10 flex items-center justify-center group">
                      @if (currentEmbed()) {
                        @if (isTheaterMode()) {
                          <!-- Placeholder: el video se muestra en el modal -->
                          <div class="flex flex-col items-center gap-3 text-center p-4">
                            <div class="w-16 h-16 rounded-full bg-[#e50914]/20 flex items-center justify-center border border-[#e50914]/30">
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#e50914]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                            <p class="text-df-accent font-bold text-sm">Reproduciendo en Modo Cine</p>
                            <button (click)="isTheaterMode.set(false)" class="text-xs text-gray-400 hover:text-white underline cursor-pointer transition-colors">
                              Volver al modo normal
                            </button>
                          </div>
                        } @else {
                          <!-- Loading state -->
                          @if (iframeLoading()) {
                            <div class="absolute inset-0 flex items-center justify-center bg-black z-10">
                              <div class="flex flex-col items-center gap-3">
                                <div class="w-12 h-12 border-4 border-[#e50914]/30 border-t-[#e50914] rounded-full animate-spin"></div>
                                <p class="text-gray-400 text-sm font-medium">Cargando video...</p>
                              </div>
                            </div>
                          }
                          <!-- Error state -->
                          @if (iframeError()) {
                            <div class="absolute inset-0 flex items-center justify-center bg-black z-20 p-6">
                              <div class="text-center max-w-sm">
                                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>
                                <h3 class="text-white font-bold text-lg mb-2">Error al cargar el video</h3>
                                <p class="text-gray-400 text-sm mb-4">Este servidor no está disponible. Prueba con otro servidor o reporta el error.</p>
                                  <div class="flex flex-col gap-2">
                                    <button (click)="tryNextServer()" class="bg-[#e50914] hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                      {{ hasMoreServers() ? 'Probar otro servidor' : 'Reintentar carga' }}
                                    </button>
                                  <a [href]="hackstorePostUrl()" target="_blank" class="bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                    Ver página original
                                  </a>
                                </div>
                              </div>
                            </div>
                          }
                          @if (!iframeError() && playerUrl()) {
                            <iframe
                              [src]="playerUrl()! | safe:'resourceUrl'"
                              class="absolute inset-0 w-full h-full"
                              allowfullscreen
                              dfIframeLoader
                              [timeoutMs]="7000"
                              (loadError)="onIframeError()"
                              (loadTimeout)="onIframeTimeout()"
                              (loadSuccess)="onIframeSuccess()">
                            </iframe>
                          }
                        }
                      }
                    </div>

                    <!-- Server Selector Responsive -->
                    <div class="flex flex-wrap gap-2 mt-4">
                      @for (embed of playersState().embeds; track $index) {
                        <button (click)="selectedEmbedIndex.set($index)"
                                [class.bg-[#e50914]]="selectedEmbedIndex() === $index"
                                [class.text-white]="selectedEmbedIndex() === $index"
                                [class.shadow-[0_0_20px_rgba(229,9,20,0.4)]]="selectedEmbedIndex() === $index"
                                [class.scale-105]="selectedEmbedIndex() === $index"
                                [class.border-[#e50914]]="selectedEmbedIndex() === $index"
                                [class.bg-white/5]="selectedEmbedIndex() !== $index"
                                [class.text-gray-400]="selectedEmbedIndex() !== $index"
                                [class.border-white/10]="selectedEmbedIndex() !== $index"
                                class="shrink-0 whitespace-nowrap px-5 py-2 rounded-xl text-[10px] md:text-sm font-black transition-all border cursor-pointer hover:bg-white/10 active:scale-95 shadow-lg">
                          {{ embed.server || 'Server ' + ($index + 1) }} ({{ embed.lang }})
                        </button>
                      }
                      
                      <!-- Manual Error Link -->
                      @if (!iframeError() && !iframeLoading()) {
                        <div class="w-full flex justify-end mt-1">
                          <button (click)="triggerManualError()" class="text-[10px] text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 opacity-60 hover:opacity-100 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            ¿No carga el video? Reportar enlace
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              @case ('DESCARGAS') {
                <div class="animate-fade-in max-w-5xl mx-auto flex flex-col gap-3">
                  @if (groupedDownloads().length === 0) {
                    <div class="text-gray-400 min-h-30 flex items-center justify-center bg-white/5 rounded-xl border border-white/5">
                      Verificando descargas disponibles...
                    </div>
                  } @else {
                    @for (group of groupedDownloads(); track group.quality) {
                      <details class="group bg-[#161616] border border-white/5 rounded-xl overflow-hidden transition-all duration-300">
                        <summary class="flex flex-col md:flex-row items-center cursor-pointer p-4 md:p-6 list-none hover:bg-white/5 transition-colors gap-4 relative">

                          <!-- Ocultar el marcador nativo de "details" -->
                          <style>details > summary::-webkit-details-marker { display: none; }</style>

                          <!-- Izquierda: Icono y Título (Calidad) -->
                          <div class="flex items-center gap-4 w-full md:w-auto">
                            <!-- Icono Estilo Llama Azul (Referencia de la imagen) -->
                            <div class="text-blue-500 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.5 10c0 4.142-3.358 7.5-7.5 7.5s-7.5-3.358-7.5-7.5c0-1.745.59-3.35 1.583-4.633.344-.446.996-.401 1.28.093.59.99 1.63 1.624 2.802 1.583l.116-.008c.51-.059.957-.428 1.1-.926l.86-2.905c.16-.54.84-.716 1.26-.33.328.3.626.638.887 1.002.324.453.948.514 1.346.126 1.134-1.104 1.956-2.58 2.215-4.249.096-.61.85-.758 1.18-.235C16.892 4)94 17.5 7.24 17.5 10z"/>
                                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM12 20c-4.418 20-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" opacity=".1"/>
                              </svg>
                            </div>
                            <h3 class="text-lg md:text-xl font-bold text-white tracking-wide shrink-0 min-w-50">{{ group.quality }}</h3>
                          </div>

                          <!-- Centro: Datos Técnicos -->
                          <div class="flex items-center gap-3 md:gap-8 flex-1 w-full md:w-auto overflow-x-auto hide-scrollbar text-center">
                             <!-- Formato -->
                             <div class="bg-black/30 rounded-lg py-2 px-4 border border-white/5 min-w-25">
                                <p class="text-white font-medium text-sm">{{ group.format }}</p>
                                <p class="text-gray-500 text-xs">Formato</p>
                             </div>
                             <!-- Tamaño -->
                             <div class="bg-black/30 rounded-lg py-2 px-4 border border-white/5 min-w-25">
                                <p class="text-white font-medium text-sm">{{ group.size }}</p>
                                <p class="text-gray-500 text-xs">Tamaño</p>
                             </div>
                             <!-- Resolución -->
                             <div class="bg-black/30 rounded-lg py-2 px-4 border border-white/5 min-w-35">
                                <p class="text-white font-medium text-sm">{{ group.resolution }}</p>
                                <p class="text-gray-500 text-xs">Resolución</p>
                             </div>
                          </div>

                          <!-- Derecha: Botón Dropdown (Rojo estilo DarkFlix) -->
                          <div class="w-full md:w-auto mt-4 md:mt-0 flex justify-end">
                            <div class="bg-[#ba0811] hover:bg-[#e50914] text-white px-6 py-3 rounded text-sm md:text-base font-bold flex items-center justify-between min-w-45 transition-colors gap-4">
                              <span>Descargar</span>
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform group-open:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </summary>

                        <!-- Contenido Desplegable: Lista de Enlaces -->
                        <div class="p-6 bg-black/40 border-t border-white/5 flex flex-col gap-3">
                          @for (dl of group.links; track dl.url) {
                            <a [href]="hackstorePostUrl()" target="_blank" class="flex justify-between items-center p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-sm md:text-base group/link overflow-hidden relative cursor-pointer shadow-lg hover:border-white/20">
                               <!-- Shine effect -->
                               <div class="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-1000 z-0 pointer-events-none"></div>

                               <!-- Info Container -->
                               <div class="flex items-center gap-4 z-10">
                                  <!-- Server Icons Customization -->
                                  @if (dl.url.includes('mega.nz')) {
                                     <div class="w-10 h-10 rounded-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-red-600/40 to-black flex items-center justify-center shrink-0 border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                                        <span class="font-black text-white text-lg tracking-tighter shadow-black drop-shadow-md">M</span>
                                     </div>
                                  } @else if (dl.url.includes('mediafire')) {
                                     <div class="w-10 h-10 rounded-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-600/40 to-black flex items-center justify-center shrink-0 border border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                                        <span class="font-black text-white px-2">mf</span>
                                     </div>
                                  } @else if (dl.url.includes('1fichier')) {
                                     <div class="w-10 h-10 rounded-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-orange-600/40 to-black flex items-center justify-center shrink-0 border border-orange-500/50 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
                                        <span class="font-black text-white text-xs">1F</span>
                                     </div>
                                  } @else if (dl.url.includes('utorrent')) {
                                     <div class="w-10 h-10 rounded-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-green-600/40 to-black flex items-center justify-center shrink-0 border border-green-500/50 shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                                        <span class="font-black text-white text-xs">µT</span>
                                     </div>
                                  } @else {
                                     <div class="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center shrink-0 border border-gray-500/50 text-gray-400">
                                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                       </svg>
                                     </div>
                                  }

                                  <div class="flex flex-col">
                                    <span class="font-bold text-gray-200 group-hover/link:text-white transition-colors capitalize md:text-lg">
                                       {{ dl.server || dl.url.split('/')[2].replace('www.', '').split('.')[0] }}
                                    </span>
                                    <span class="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 group-hover/link:text-gray-400 transition-colors">
                                       <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-yellow-600/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                      Enlace Acortado Protegido
                                    </span>
                                  </div>
                               </div>

                               <!-- Right Accents -->
                               <div class="flex items-center gap-3 md:gap-6 z-10">
                                 <span class="text-gray-400 font-medium tracking-wide text-[10px] md:text-xs bg-black/40 px-3 py-1.5 rounded-lg hidden sm:inline-block border border-white/5 uppercase shadow-inner">{{ dl.lang }}</span>
                                 <div class="text-[#e50914] group-hover/link:scale-110 transition-transform bg-[#e50914]/10 p-2 md:p-3 rounded-full border border-[#e50914]/20 flex items-center gap-1">
                                   <!-- External link icon instead of download to indicate redirect -->
                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 md:w-5 md:h-5">
                                     <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                   </svg>
                                 </div>
                               </div>
                            </a>
                          }
                        </div>
                      </details>
                    }
                  }
                </div>
              }

              @case ('REPARTO') {
                <div class="animate-fade-in">
                  @if (castState().length === 0) {
                    <div class="text-gray-400">Cargando reparto...</div>
                  } @else {
                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-x-4 gap-y-8 pb-6 justify-items-center">
                      @for (actor of castState(); track actor.term_id) {
                        <div class="flex flex-col items-center w-full max-w-30">
                          <div class="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden mb-3 border-2 border-white/10 bg-df-card relative">
                            <!-- Si la API provee path local, usualmente es de la base TMDB -->
                            @if (actor.meta?.profile_path; as path) {
                               <img [src]="'https://image.tmdb.org/t/p/w276_and_h350_face' + path" class="w-full h-full object-cover shadow-inner hover:scale-110 transition-transform duration-500">
                            } @else {
                               <div class="w-full h-full flex items-center justify-center text-3xl font-bold text-white/20">{{ actor.term_name.charAt(0) }}</div>
                            }
                          </div>
                          <p class="text-white text-center font-bold text-xs md:text-sm leading-tight mb-1 line-clamp-2 px-1">{{ actor.term_name }}</p>
                          <p class="text-gray-400 text-center text-[10px] md:text-xs leading-tight line-clamp-2 px-1">{{ actor.meta?.character || actor.dep }}</p>
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
                        <a [routerLink]="rel | mediaUrl" class="block relative aspect-2/3 rounded-lg overflow-hidden group border border-white/5 bg-df-card">
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

              @case ('GALERÍA') {
                <div class="animate-fade-in">
                  @if (galleryImages().length === 0) {
                    <div class="text-gray-400 py-8">Esta película no tiene galería de imágenes disponible.</div>
                  } @else {
                    <!-- Grid of thumbnails -->
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      @for (img of galleryImages(); track img; let i = $index) {
                        <div (click)="lightboxIndex.set(i)"
                             class="relative aspect-video rounded-lg overflow-hidden cursor-pointer group border border-white/5 bg-df-card">
                          <img [src]="'https://image.tmdb.org/t/p/w780' + img"
                               class="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-75 transition-all duration-500"
                               loading="lazy">
                          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                            </svg>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- LIGHTBOX OVERLAY -->
                @if (lightboxIndex() !== null) {
                  <div class="fixed inset-0 z-300 bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in"
                       (click)="lightboxIndex.set(null)">
                    <!-- Prev -->
                    <button (click)="$event.stopPropagation(); lightboxIndex.set((lightboxIndex()! - 1 + galleryImages().length) % galleryImages().length)"
                            class="absolute left-2 md:left-6 z-10 bg-black/60 hover:bg-[#e50914] text-white rounded-full p-3 border border-white/10 transition-all cursor-pointer shadow-2xl">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <!-- Image -->
                    <img [src]="'https://image.tmdb.org/t/p/w1280' + galleryImages()[lightboxIndex()!]"
                         (click)="$event.stopPropagation()"
                         class="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl border border-white/10">
                    <!-- Next -->
                    <button (click)="$event.stopPropagation(); lightboxIndex.set((lightboxIndex()! + 1) % galleryImages().length)"
                            class="absolute right-2 md:right-6 z-10 bg-black/60 hover:bg-[#e50914] text-white rounded-full p-3 border border-white/10 transition-all cursor-pointer shadow-2xl">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                    <!-- Counter + close -->
                    <div class="absolute top-4 right-4 flex items-center gap-3">
                      <span class="text-white/70 text-sm font-medium">{{ lightboxIndex()! + 1 }} / {{ galleryImages().length }}</span>
                      <button (click)="lightboxIndex.set(null)" class="bg-black/60 hover:bg-[#e50914] text-white rounded-full p-2 border border-white/10 transition-all cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              }
              @case ('TRAILER') {
                <div class="animate-fade-in flex flex-col items-center">
                  @if (trailerUrl()) {
                    <div class="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.7)] border border-white/10 bg-black relative group">
                      
                      @if (!showTrailerPlayer()) {
                        <!-- Poster Overlay View -->
                        <div class="absolute inset-0 z-10 flex items-center justify-center cursor-pointer overflow-hidden" (click)="showTrailerPlayer.set(true)">
                          <!-- Backdrop with blur-in effect -->
                          <img [src]="movie()! | wpImage:'backdrop'" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-50" alt="Trailer Preview">
                          
                          <!-- Glassmorphism Content -->
                          <div class="absolute inset-0 bg-black/20 flex flex-col items-center justify-center gap-6">
                            <!-- Glowing Play Button -->
                            <div class="w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#e50914] flex items-center justify-center shadow-[0_0_50px_rgba(229,9,20,0.6)] group-hover:scale-110 transition-transform duration-500 relative">
                               <div class="absolute inset-0 rounded-full animate-ping bg-[#e50914] opacity-20"></div>
                               <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 md:w-14 md:h-14 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M8 5v14l11-7z" />
                               </svg>
                            </div>
                            
                            <div class="text-center">
                              <p class="text-white font-black text-xl md:text-3xl uppercase tracking-tighter drop-shadow-2xl">Reproducir Tráiler</p>
                              <p class="text-white/60 text-xs md:text-sm font-bold uppercase tracking-widest mt-1">Official Teaser &bull; HD</p>
                            </div>
                          </div>
                        </div>
                      } @else {
                        <!-- Actual YouTube Iframe -->
                        <iframe [src]="trailerUrl()!"
                                class="w-full h-full"
                                frameborder="0"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowfullscreen>
                        </iframe>
                      }

                      <!-- Decorative corner accents -->
                      <div class="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#e50914]/40 rounded-tl-2xl pointer-events-none group-hover:border-[#e50914]/70 transition-colors z-20"></div>
                      <div class="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#e50914]/40 rounded-br-2xl pointer-events-none group-hover:border-[#e50914]/70 transition-colors z-20"></div>
                    </div>

                    <div class="mt-10 flex flex-col md:flex-row items-center justify-between w-full max-w-5xl gap-6">
                      <div class="text-center md:text-left">
                        <h3 class="text-2xl md:text-3xl font-black text-white mb-2 uppercase tracking-tight">Tráiler Oficial</h3>
                        <p class="text-gray-400 max-w-2xl text-sm md:text-base font-medium">
                          Disfruta de un vistazo exclusivo a <span class="text-white font-bold">{{ movie()?.title }}</span>.
                          Prepárate para la experiencia completa en DarkFlix.
                        </p>
                      </div>
                      <button (click)="playMedia()" class="shrink-0 bg-white text-black hover:bg-[#e50914] hover:text-white font-black py-3 px-8 rounded-full transition-all active:scale-95 uppercase tracking-widest text-xs cursor-pointer shadow-2xl">
                        Ver Película Ahora
                      </button>
                    </div>
                  } @else {
                    <div class="text-gray-400 py-20 flex flex-col items-center gap-6 bg-white/5 w-full rounded-2xl border border-white/5">
                      <div class="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p class="font-bold tracking-wide uppercase text-xs">El tráiler no está disponible temporalmente</p>
                    </div>
                  }
                </div>
              }
            }
          </div>
        </div>
      } @placeholder {
        <div class="max-w-7xl mx-auto px-6 pb-24 flex flex-col items-center justify-center min-h-64 text-white/20">
          <div class="w-10 h-10 border-4 border-white/5 border-t-[#e50914] rounded-full animate-spin mb-4"></div>
          <p class="text-xs font-bold uppercase tracking-widest animate-pulse">Cargando detalles...</p>
        </div>
      }

        <!-- THEATER MODE MODAL (OVERLAY DE PANTALLA COMPLETA) -->
        @if (isTheaterMode()) {
          <div class="fixed inset-0 z-100 bg-black flex flex-col animate-fade-in overflow-hidden"
               (mousemove)="onPlayerInteraction()"
               (click)="onPlayerInteraction()"
               (touchstart)="onPlayerInteraction()">

          <!-- Top Bar: Título + Cerrar (Flotante) -->
          <div class="absolute top-0 left-0 right-0 px-4 md:px-6 py-3 bg-linear-to-b from-black/90 to-transparent z-50 transition-all duration-500"
               [class.opacity-0]="!showControls()"
               [class.-translate-y-full]="!showControls()"
               [class.pointer-events-none]="!showControls()">
            <div class="flex items-center justify-between max-w-7xl mx-auto">
              <h2 class="text-white font-bold tracking-wide text-xs md:text-lg uppercase drop-shadow-md truncate flex-1 mr-4">
                {{ movie()?.title }} <span class="mx-1 text-[#e50914]">•</span> <span class="font-normal text-gray-400 capitalize">{{ currentEmbed()?.server || 'Servidor' }}</span>
              </h2>
              <button (click)="isTheaterMode.set(false)" class="text-white bg-white/10 hover:bg-[#e50914] border border-white/10 rounded-full p-2.5 transition-all backdrop-blur-md cursor-pointer shadow-2xl shrink-0 active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Video Player Iframe -->
          <div class="flex-1 w-full relative bg-black min-h-0">
             @if (currentEmbed()) {
               <!-- Loading state -->
               @if (iframeLoading()) {
                 <div class="absolute inset-0 flex items-center justify-center bg-black z-10">
                   <div class="flex flex-col items-center gap-3">
                     <div class="w-12 h-12 border-4 border-[#e50914]/30 border-t-[#e50914] rounded-full animate-spin"></div>
                     <p class="text-gray-400 text-sm font-medium">Cargando video...</p>
                   </div>
                 </div>
               }
               <!-- Error state -->
               @if (iframeError()) {
                 <div class="absolute inset-0 flex items-center justify-center bg-black z-20 p-6">
                   <div class="text-center max-w-sm">
                     <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                       <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                         <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                       </svg>
                     </div>
                     <h3 class="text-white font-bold text-lg mb-2">Error al cargar el video</h3>
                     <p class="text-gray-400 text-sm mb-4">Este servidor no está disponible. Prueba con otro servidor o reporta el error.</p>
                     <div class="flex flex-col gap-2">
                       @if (hasMoreServers()) {
                         <button (click)="tryNextServer()" class="bg-[#e50914] hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                             <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                           Probar otro servidor
                         </button>
                       }
                       <a [href]="hackstorePostUrl()" target="_blank" class="bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                           <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                         </svg>
                         Ver página original
                       </a>
                     </div>
                   </div>
                 </div>
               }
               <iframe [src]="currentEmbed()!.url | safe:'resourceUrl'" class="w-full h-full border-none" allowfullscreen
                 dfIframeLoader
                 (loadError)="onIframeError()"
                 (loadTimeout)="onIframeTimeout()"
                 (loadSuccess)="onIframeSuccess()"></iframe>

               <!-- Interaction Overlay: Captures first tap when controls are hidden -->
               @if (!showControls()) {
                 <div class="absolute inset-0 z-40 bg-transparent cursor-pointer"
                      (click)="onPlayerInteraction()"
                      (touchstart)="onPlayerInteraction()">
                 </div>
               }
             }

             <!-- Botón flotante "¿No funciona?" (Hides with controls) -->
             <div class="absolute bottom-24 right-4 md:right-8 z-50 transition-all duration-500"
                  [class.opacity-0]="!showControls()"
                  [class.translate-y-10]="!showControls()"
                  [class.pointer-events-none]="!showControls()">
                @if (!showHelperPanel()) {
                  <button (click)="showHelperPanel.set(true)"
                          class="bg-black/60 hover:bg-[#e50914] text-white text-[10px] md:text-xs font-bold px-4 py-2.5 rounded-full border border-white/20 backdrop-blur-md cursor-pointer transition-all shadow-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ¿Problemas con el video?
                  </button>
                } @else {
                  <!-- Panel de ayuda expandido -->
                  <div class="bg-black/95 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl w-64 animate-fade-in border-b-4 border-b-[#e50914]">
                    <div class="flex items-center justify-between mb-3">
                      <p class="text-white font-bold text-sm">¿Problemas para ver?</p>
                      <button (click)="showHelperPanel.set(false)" class="text-gray-400 hover:text-white cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div class="flex flex-col gap-2">
                      @if (playersState().embeds.length > 1) {
                        <button (click)="tryNextServer(); showHelperPanel.set(false)"
                                class="w-full flex items-center gap-2 bg-white/10 hover:bg-[#e50914] text-white text-xs font-bold py-2.5 px-3 rounded-lg transition-all cursor-pointer border border-white/5">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Probar otro servidor
                        </button>
                      }
                      <a [href]="hackstorePostUrl()" target="_blank"
                         class="w-full flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-3 rounded-lg transition-all cursor-pointer border border-white/5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Ver página original
                      </a>
                    </div>
                  </div>
                }
              </div>
            </div>
              <!-- Server Selector Capsule (Only in Theater Mode) -->
              <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-full max-w-fit px-4"
                   [class.opacity-0]="!showControls()"
                   [class.translate-y-full]="!showControls()"
                   [class.pointer-events-none]="!showControls()">
                <div class="bg-zinc-900/90 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 overflow-hidden">
                  <span class="hidden md:block text-[10px] font-black text-gray-500 uppercase tracking-widest border-r border-white/10 pr-3 mr-1">Servidores</span>
                  <div class="flex overflow-x-auto hide-scrollbar gap-2 max-w-[80vw] md:max-w-4xl snap-x">
                    @for (embed of playersState().embeds; track $index) {
                      <button (click)="$event.stopPropagation(); selectedEmbedIndex.set($index); resetControlsTimer()"
                              [class.bg-[#e50914]]="selectedEmbedIndex() === $index"
                              [class.text-white]="selectedEmbedIndex() === $index"
                              [class.shadow-[0_0_15px_rgba(229,9,20,0.5)]]="selectedEmbedIndex() === $index"
                              [class.scale-105]="selectedEmbedIndex() === $index"
                              [class.border-[#e50914]]="selectedEmbedIndex() === $index"
                              [class.bg-white/5]="selectedEmbedIndex() !== $index"
                              [class.text-gray-400]="selectedEmbedIndex() !== $index"
                               [class.border-white/10]="selectedEmbedIndex() !== $index"
                              class="shrink-0 snap-start whitespace-nowrap px-4 py-2 rounded-xl text-[10px] md:text-xs font-black transition-all border cursor-pointer hover:bg-white/10 active:scale-95">
                        {{ embed.server || 'Server ' + ($index + 1) }} ({{ embed.lang }})
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LazyImageDirective, WpImagePipe, BadgeComponent, SafePipe, FormsModule, MediaUrlPipe, IframeLoaderDirective]
})
export class MovieDetailsComponent {
  typeSlug = input.required<string>();
  slug = input.required<string>();

  private wpService = inject(WpMediaService);
  private location = inject(Location);
  public myListService = inject(MyListService);
  public watchHistoryService = inject(WatchHistoryService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private sanitizer = inject(DomSanitizer);
  private lastResetMediaId: string | number = '';

  private stateMedia = history.state.media as ApiMedia | undefined;

  activeTab = signal<'REPRODUCIR' | 'DESCARGAS' | 'REPARTO' | 'SIMILARES' | 'EPISODIOS' | 'GALERÍA' | 'TRAILER'>(
    (this.stateMedia?.type === 'tvshows' || this.stateMedia?.type === 'animes') ? 'EPISODIOS' : 'REPRODUCIR'
  );
  selectedEmbedIndex = signal<number>(0);
  isTheaterMode = signal(false);
  showHelperPanel = signal(false);
  lightboxIndex = signal<number | null>(null);
  shareCopied = signal(false);
  showTrailerPlayer = signal(false);
  showControls = signal(true);
  private controlsTimer: any;

  selectedSeason = signal<string>('1');
  selectedEpisodeId = signal<string | number | undefined>(undefined);

  @ViewChild(IframeLoaderDirective) loader?: IframeLoaderDirective;

  // Iframe error handling state
  iframeError = signal(false);
  iframeLoading = signal(true);


  public onPlayerInteraction(): void {
    if (!this.isTheaterMode()) return;
    this.showControls.set(true);
    this.resetControlsTimer();
  }

  public resetControlsTimer(): void {
    if (this.controlsTimer) clearTimeout(this.controlsTimer);
    this.controlsTimer = setTimeout(() => {
      // No ocultar si el panel de ayuda está abierto
      if (!this.showHelperPanel()) {
        this.showControls.set(false);
      }
    }, 3500);
  }

  mediaState = toSignal(
    combineLatest([toObservable(this.typeSlug), toObservable(this.slug)]).pipe(
      switchMap(([currentTypeSlug, currentSlug]) => {
         let postType = 'movies';
         if (currentTypeSlug === 'series') postType = 'tvshows';
         else if (currentTypeSlug === 'animes') postType = 'animes';

         // Carga ultra rápida si la tarjeta trae el media en state, checando equivalencia
         if (this.stateMedia && this.stateMedia.slug === currentSlug) {
           return of({ data: this.stateMedia, error: false });
         }

         return this.wpService.getMediaBySlug(currentSlug, postType).pipe(
           map(res => ({ data: res, error: false })),
           catchError(() => of({ data: null, error: true }))
         );
      }),
      distinctUntilChanged((prev, curr) => prev?.data?._id === curr?.data?._id)
    )
  );

  movie = computed(() => this.mediaState()?.data || null);

  playMedia() {
    if (this.movie()?.type === 'tvshows' || this.movie()?.type === 'animes') {
      this.activeTab.set('EPISODIOS');
      // Asegurarse de que el scroll baje hacia la sección de episodios de forma fluida
      window.scrollTo({ top: window.innerHeight * 0.65, behavior: 'smooth' });
    } else {
      this.isTheaterMode.set(true);
    }
  }

  /** Comparte la película usando Web Share API o fallback a clipboard */
  shareMovie(): void {
    const mv = this.movie();
    if (!mv) return;
    const url = window.location.href;
    const text = `${mv.title} — mírala en DarkFlix`;
    if (navigator.share) {
      navigator.share({ title: mv.title, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.shareCopied.set(true);
        setTimeout(() => this.shareCopied.set(false), 2500);
      });
    }
  }

  tryNextServer(): void {
    const embeds = this.playersState().embeds;
    const total = embeds.length;
    if (total > 0) {
      if (total > 1) {
        this.selectedEmbedIndex.set((this.selectedEmbedIndex() + 1) % total);
      }
      // Reset error state regardless of total (allows "Retry" for single server)
      this.iframeError.set(false);
      this.iframeLoading.set(true);
      this.loader?.reset();
    }
  }

  /** Called when iframe reports a load error */
  onIframeError(): void {
    this.iframeError.set(true);
    this.iframeLoading.set(false);
  }

  /** Called when iframe load times out */
  onIframeTimeout(): void {
    this.iframeError.set(true);
    this.iframeLoading.set(false);
  }

  /** Manually trigger error state if player is stuck or showing 404 */
  triggerManualError(): void {
    this.iframeError.set(true);
    this.iframeLoading.set(false);
  }

  /** Called when iframe loads successfully */
  onIframeSuccess(): void {
    this.iframeError.set(false);
    this.iframeLoading.set(false);
  }

  /** Computed: whether there are more servers to try */
  hasMoreServers = computed(() => {
    return this.playersState().embeds.length > 1;
  });

  activeMediaId = computed(() => {
    const rootId = this.movie()?._id;
    if (!rootId) return undefined;
    const isSeries = this.movie()?.type === 'tvshows' || this.movie()?.type === 'animes';
    return isSeries ? this.selectedEpisodeId() : rootId;
  });

  playersState = toSignal(
    toObservable(this.activeMediaId).pipe(
      distinctUntilChanged(),
      filter(activeId => !!activeId),
      switchMap(currentId => concat(
        of({ embeds: [], downloads: [] }),
        this.wpService.getMoviePlayers(currentId!).pipe(
          catchError(() => of({ embeds: [], downloads: [] }))
        )
      ))
    ), { initialValue: { embeds: [], downloads: [] } }
  );

  downloadsState = toSignal(
    toObservable(this.activeMediaId).pipe(
      distinctUntilChanged(),
      filter(activeId => !!activeId),
      switchMap(currentId => concat(
        of([]),
        this.wpService.getMovieDownloads(currentId!).pipe(
          catchError(() => of([]))
        )
      ))
    ), { initialValue: [] }
  );

  episodesResponse = toSignal(
    combineLatest([toObservable(this.movie), toObservable(this.selectedSeason)]).pipe(
      filter(([m]) => m?.type === 'tvshows' || m?.type === 'animes'),
      distinctUntilChanged((prev, curr) => prev[0]?._id === curr[0]?._id && prev[1] === curr[1]),
      switchMap(([currentMovie, season]) => this.wpService.getTvShowEpisodes(currentMovie!._id, season).pipe(
        catchError(() => of(undefined))
      ))
    ), { initialValue: undefined }
  );

  castState = toSignal(
    toObservable(this.movie).pipe(
      filter(m => !!m),
      distinctUntilChanged((prev, curr) => prev?._id === curr?._id),
      switchMap(currentMovie => this.wpService.getMovieCast(currentMovie!._id, currentMovie!.type || 'movies').pipe(catchError(() => of([]))))
    ), { initialValue: [] }
  );

  relatedState = toSignal(
    toObservable(this.movie).pipe(
      filter(m => !!m),
      distinctUntilChanged((prev, curr) => prev?._id === curr?._id),
      switchMap(currentMovie => this.wpService.getRelatedMedia(currentMovie!._id).pipe(catchError(() => of([]))))
    ), { initialValue: [] }
  );

  groupedDownloads = computed(() => {
    const downloads = this.downloadsState();
    if (!downloads) return [];

    const groups = new Map<string, any>();
    for (const dl of downloads) {
      if (!groups.has(dl.quality)) {
        groups.set(dl.quality, {
          quality: dl.quality,
          format: dl.format || 'MKV',
          size: dl.size || '--',
          resolution: dl.resolution || '--',
          links: []
        });
      }
      groups.get(dl.quality)!.links.push(dl);
    }
    return Array.from(groups.values());
  });

  hasError = computed(() => this.mediaState()?.error === true);
  loadingOrPending = computed(() => this.mediaState() === undefined && !this.hasError());

  currentEmbed = computed(() => {
    const embeds = this.playersState().embeds;
    if (!embeds || embeds.length === 0) return null;
    return embeds[this.selectedEmbedIndex()] || embeds[0];
  });

  playerUrl = computed(() => {
    // Si no estamos en la pestaña de reproducir, matamos la URL para liberar recursos
    if (this.activeTab() !== 'REPRODUCIR') return null;
    return this.currentEmbed()?.url || null;
  });

  getYear = computed(() => {
    const mv = this.movie();
    if (mv?.years && mv.years.length > 0) {
      if (mv.release_date) {
        return new Date(mv.release_date).getFullYear().toString();
      }
    }
    return mv?.release_date ? parseInt(mv.release_date).toString() : null;
  });

  getQuality = computed(() => {
    return this.movie()?.quality?.length ? 'HD' : null;
  });

  hackstorePostUrl = computed(() => {
     const mv = this.movie();
     if (!mv) return 'https://hackstore.mx/';
     let cat = 'peliculas';
     if (mv.type === 'tvshows' || mv.type === 'series') cat = 'series';
     else if (mv.type === 'animes') cat = 'animes';
     return `https://hackstore.mx/${cat}/${mv.slug}`;
  });

  // Galería: parsear el campo gallery (rutas TMDB separadas por saltos de línea)
  galleryImages = computed(() => {
    const raw = this.movie()?.gallery;
    if (!raw) return [];
    return raw.split('\n').map((p: string) => p.trim()).filter((p: string) => p.length > 0);
  });

  trailerUrl = computed(() => {
    const trailer = this.movie()?.trailer;
    if (!trailer) return null;

    let videoId = '';
    // Si el trailer ya es un ID directo de 11 caracteres
    if (trailer.length === 11 && !trailer.includes('/')) {
      videoId = trailer;
    } else {
      // Buscar si es URL completa de YouTube
      const match = trailer.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
      if (match && match[1]) {
        videoId = match[1];
      }
    }

    if (videoId) {
      // Usar autoplay=1 cuando se activa el player para que el usuario no tenga que dar click de nuevo
      const autoplay = this.showTrailerPlayer() ? '1' : '0';
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=${autoplay}`);
    }

    return null;
  });

  scrollToTabs() {
    // Buscar la sección de tabs por su contenedor
    const element = document.querySelector('.max-w-7xl.mx-auto.px-6.pb-24');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  constructor() {
    // Efecto para resetear estado del iframe cuando cambia el embed seleccionado
    effect(() => {
      const embed = this.currentEmbed();
      if (embed) {
        // Reset iframe state when switching to a new embed
        this.iframeError.set(false);
        this.iframeLoading.set(true);
        this.loader?.reset();
      }
    });

    // Efecto para gestión de controles en Modo Teatro
    effect(() => {
      if (this.isTheaterMode()) {
        this.resetControlsTimer();
      } else {
        this.showControls.set(true);
        if (this.controlsTimer) clearTimeout(this.controlsTimer);
      }
    });

    // Efecto para SEO, Historial y Reset de Estado
    effect(() => {
      const currentMovie = this.movie();
      if (currentMovie) {
        // Actualizar META/SEO nativo
        this.titleService.setTitle(`Ver ${currentMovie.title} | DarkFlix`);
        this.metaService.updateTag({ name: 'description', content: currentMovie.overview || 'Disfruta de este título en DarkFlix.' });
        this.metaService.updateTag({ property: 'og:title', content: currentMovie.title });
        this.metaService.updateTag({ property: 'og:description', content: currentMovie.overview || '' });
        if (currentMovie.images?.poster) {
           this.metaService.updateTag({ property: 'og:image', content: `https://hackstore.mx${currentMovie.images.poster}` });
        }

        // Registrar visita (limpio)
        this.wpService.registerHit(currentMovie._id, currentMovie.type).pipe(take(1)).subscribe();
        this.watchHistoryService.addToHistory(currentMovie);

        // Reset state on movie change (como cuando se navega desde Similares)
        // Solo si la ID es diferente a la última manejada
        if (currentMovie._id !== this.lastResetMediaId) {
          this.lastResetMediaId = currentMovie._id;
          untracked(() => {
            this.activeTab.set((currentMovie.type === 'tvshows' || currentMovie.type === 'animes') ? 'EPISODIOS' : 'REPRODUCIR');
            this.selectedEpisodeId.set(undefined);
            this.selectedSeason.set('1');
            this.selectedEmbedIndex.set(0);
            this.isTheaterMode.set(false);
            this.showHelperPanel.set(false);
            this.showTrailerPlayer.set(false);
            
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          });
        }
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
