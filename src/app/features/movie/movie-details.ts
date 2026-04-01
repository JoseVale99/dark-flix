import { Component, ChangeDetectionStrategy, inject, input, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WpMediaService } from '@services/wp-media';
import { ApiMedia } from '@models';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, combineLatest, filter } from 'rxjs';
import { LazyImageDirective } from '@shared/directives/lazy-image';
import { WpImagePipe } from '@shared/pipes/wp-image';
import { BadgeComponent } from '@shared/components/badge/badge';
import { Location } from '@angular/common';
import { SafePipe } from '@shared/pipes/safe';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

            <div class="flex flex-col sm:flex-row gap-4 mt-6">
              <button (click)="isTheaterMode.set(true)" class="bg-[#e50914] hover:bg-red-700 text-white font-bold py-3 px-8 rounded flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(229,9,20,0.5)] active:scale-95 text-center text-lg w-fit cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 shrink-0">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                VER AHORA
              </button>
            </div>
          </div>
          
        </div>

        <!-- COMPONENTES EXTENDIDOS (TABS: REPRODUCTORES, DESCARGAS, REPARTO...) -->
        <div class="max-w-7xl mx-auto px-6 pb-24 text-white relative z-30">
          
          <!-- TABS NAVIGATION -->
          <div class="flex flex-wrap gap-4 md:gap-8 border-b border-white/10 mb-8 pt-8">
            @if (movie()?.type === 'tvshows') {
              <button (click)="activeTab.set('EPISODIOS')"
                      [class.text-white]="activeTab() === 'EPISODIOS'"
                      [class.border-white]="activeTab() === 'EPISODIOS'"
                      class="pb-2 font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 hover:text-white"
                      [class.text-gray-400]="activeTab() !== 'EPISODIOS'"
                      [class.border-transparent]="activeTab() !== 'EPISODIOS'">
                EPISODIOS
              </button>
            }
            <button (click)="activeTab.set('REPRODUCIR')"
                    [class.text-white]="activeTab() === 'REPRODUCIR'"
                    [class.border-white]="activeTab() === 'REPRODUCIR'"
                    class="pb-2 font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 hover:text-white"
                    [class.text-gray-400]="activeTab() !== 'REPRODUCIR'"
                    [class.border-transparent]="activeTab() !== 'REPRODUCIR'">
              {{ movie()?.type === 'tvshows' ? 'VER EPISODIO SELECCIONADO' : 'REPRODUCTOR EN LÍNEA' }}
            </button>
            <button (click)="activeTab.set('DESCARGAS')"
                    [class.text-white]="activeTab() === 'DESCARGAS'"
                    [class.border-white]="activeTab() === 'DESCARGAS'"
                    class="pb-2 font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 hover:text-white"
                    [class.text-gray-400]="activeTab() !== 'DESCARGAS'"
                    [class.border-transparent]="activeTab() !== 'DESCARGAS'">
              DESCARGAS
            </button>
            <button (click)="activeTab.set('REPARTO')"
                    [class.text-white]="activeTab() === 'REPARTO'"
                    [class.border-white]="activeTab() === 'REPARTO'"
                    class="pb-2 font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 hover:text-white"
                    [class.text-gray-400]="activeTab() !== 'REPARTO'"
                    [class.border-transparent]="activeTab() !== 'REPARTO'">
              REPARTO
            </button>
            <button (click)="activeTab.set('SIMILARES')"
                    [class.text-white]="activeTab() === 'SIMILARES'"
                    [class.border-white]="activeTab() === 'SIMILARES'"
                    class="pb-2 font-bold text-xs md:text-sm uppercase tracking-wider transition-all border-b-2 hover:text-white"
                    [class.text-gray-400]="activeTab() !== 'SIMILARES'"
                    [class.border-transparent]="activeTab() !== 'SIMILARES'">
              TÍTULOS SIMILARES
            </button>
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
                                class="flex items-center gap-4 text-left p-4 md:p-5 bg-[#161616] hover:bg-white/10 border border-white/5 transition-colors rounded-xl group relative overflow-hidden"
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
                    <!-- Iframe Container -->
                    <div class="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative border border-white/10 flex items-center justify-center group">
                      @if (!isTheaterMode() && currentEmbed()) {
                        <iframe [src]="currentEmbed()!.url | safe:'resourceUrl'" class="absolute inset-0 w-full h-full" allowfullscreen></iframe>
                      } @else if (isTheaterMode()) {
                        <div class="text-df-accent font-bold animate-pulse">Reproduciendo en Modo Cine...</div>
                      }
                      
                      <!-- Overlay expand button (Only visible in Tab mode) -->
                      <button (click)="isTheaterMode.set(true)" class="absolute bottom-4 right-4 bg-black/60 hover:bg-[#e50914] backdrop-blur text-white p-3 rounded opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 14v-2m0 0h2m-2 0l4 4m10-4v-2m0 0h-2m2 0l-4 4m-6-8V4m0 0H6m2 0l-4 4m10 4V4m0 0h2m-2 0l4 4" />
                        </svg>
                      </button>
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
                            <a [href]="dl.url" target="_blank" class="flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all text-sm md:text-base group/link">
                               <div class="flex items-center gap-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 group-hover/link:text-df-accent transition-colors hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                  <span class="font-bold text-gray-300 group-hover/link:text-white transition-colors">{{ dl.server || dl.url.split('/')[2] }}</span>
                               </div>
                               <span class="text-gray-400 font-medium tracking-wide">Audio: {{ dl.lang }}</span>
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

      <!-- THEATER MODE MODAL (OVERLAY DE PANTALLA COMPLETA) -->
      @if (isTheaterMode()) {
        <div class="fixed inset-0 z-100 bg-black flex flex-col animate-fade-in">
          
          <!-- Top Controls Bar -->
          <div class="absolute top-0 inset-x-0 h-24 bg-linear-to-b from-black to-transparent flex items-start justify-between px-6 pt-6 z-50 pointer-events-none">
            <h2 class="text-white font-bold tracking-widest text-sm md:text-lg opacity-80 uppercase drop-shadow-md pointer-events-auto">
              {{ movie()?.title }} <span class="mx-2 text-[#e50914]">•</span> <span class="font-normal">{{ currentEmbed()?.server || 'Servidor en Línea' }}</span>
            </h2>
            <button (click)="isTheaterMode.set(false)" class="text-white/70 hover:text-white bg-black/40 hover:bg-[#e50914] border border-white/10 rounded-full p-2 transition-all pointer-events-auto backdrop-blur cursor-pointer shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Video Player Iframe -->
          <div class="flex-1 w-full h-full relative flex flex-col justify-center bg-black">
             @if (currentEmbed()) {
               <!-- max-h-screen para evitar scrolls indeseados -->
               <iframe [src]="currentEmbed()!.url | safe:'resourceUrl'" class="w-full h-[90vh] md:h-screen border-none" allowfullscreen></iframe>
             }
          </div>

          <!-- Bottom Floating Server Selector -->
          <div class="absolute bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
             <div class="flex flex-wrap justify-center gap-2 bg-black/50 backdrop-blur-md p-2 md:p-3 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto max-w-4xl max-h-[25vh] overflow-y-auto hide-scrollbar">
                @for (embed of playersState().embeds; track $index) {
                  <button (click)="selectedEmbedIndex.set($index)"
                          [class.bg-[#e50914]]="selectedEmbedIndex() === $index"
                          [class.text-white]="selectedEmbedIndex() === $index"
                          [class.border-[#e50914]]="selectedEmbedIndex() === $index"
                          [class.bg-black/40]="selectedEmbedIndex() !== $index"
                          [class.text-gray-300]="selectedEmbedIndex() !== $index"
                          [class.border-white/10]="selectedEmbedIndex() !== $index"
                          [class.hover:bg-white/20]="selectedEmbedIndex() !== $index"
                          class="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border">
                    {{ embed.server || 'Server ' + ($index + 1) }} - {{ embed.lang }}
                  </button>
                }
             </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, LazyImageDirective, WpImagePipe, BadgeComponent, SafePipe, FormsModule]
})
export class MovieDetailsComponent {
  id = input.required<string>();

  private wpService = inject(WpMediaService);
  private location = inject(Location);
  
  private stateMedia = history.state.media as ApiMedia | undefined;

  activeTab = signal<'REPRODUCIR' | 'DESCARGAS' | 'REPARTO' | 'SIMILARES' | 'EPISODIOS'>(
    this.stateMedia?.type === 'tvshows' ? 'EPISODIOS' : 'REPRODUCIR'
  );
  selectedEmbedIndex = signal<number>(0);
  isTheaterMode = signal(false);

  selectedSeason = signal<string>('1');
  selectedEpisodeId = signal<string | number | undefined>(undefined);

  mediaState = toSignal(
    toObservable(this.id).pipe(
      switchMap(currentId => {
        if (this.stateMedia && this.stateMedia._id == currentId) {
          return of({ data: this.stateMedia, error: false });
        }
        return this.wpService.getMediaById(currentId).pipe(
          map(res => ({ data: res, error: false })),
          catchError(() => of({ data: null, error: true }))
        );
      })
    )
  );
  
  movie = computed(() => this.mediaState()?.data || null);

  activeMediaId = computed(() => {
    return this.movie()?.type === 'tvshows' ? this.selectedEpisodeId() : this.id();
  });

  playersState = toSignal(
    toObservable(this.activeMediaId).pipe(
      filter(id => !!id),
      switchMap(currentId => this.wpService.getMoviePlayers(currentId!).pipe(
        catchError(() => of({ embeds: [], downloads: [] }))
      ))
    ), { initialValue: { embeds: [], downloads: [] } }
  );

  downloadsState = toSignal(
    toObservable(this.activeMediaId).pipe(
      filter(id => !!id),
      switchMap(currentId => this.wpService.getMovieDownloads(currentId!).pipe(
        catchError(() => of([]))
      ))
    ), { initialValue: [] }
  );

  episodesResponse = toSignal(
    combineLatest([toObservable(this.id), toObservable(this.selectedSeason)]).pipe(
      filter(() => this.movie()?.type === 'tvshows'),
      switchMap(([currentId, season]) => this.wpService.getTvShowEpisodes(currentId, season).pipe(
        catchError(() => of(undefined))
      ))
    ), { initialValue: undefined }
  );

  castState = toSignal(
    toObservable(this.id).pipe(
      switchMap(currentId => this.wpService.getMovieCast(currentId, this.movie()?.type || 'movies').pipe(catchError(() => of([]))))
    ), { initialValue: [] }
  );

  relatedState = toSignal(
    toObservable(this.id).pipe(
      switchMap(currentId => this.wpService.getRelatedMedia(currentId).pipe(catchError(() => of([]))))
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

  constructor() {
    effect(() => {
      const currentMovie = this.movie();
      if (currentMovie) {
        this.wpService.registerHit(currentMovie._id, currentMovie.type).subscribe();
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
