import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WpMediaService } from '@services/wp-media';
import { ApiMedia } from '@models';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { LazyImageDirective } from '@shared/directives/lazy-image';
import { WpImagePipe } from '@shared/pipes/wp-image';
import { BadgeComponent } from '@shared/components/badge/badge';
import { Location } from '@angular/common';

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
              @if (getQuality()) {
                <df-badge [text]="getQuality()!" variant="accent" />
              }
              @if (getYear()) {
                <df-badge [text]="getYear()!" variant="default" />
              }
              <df-badge text="Cinematic" variant="default" />
            </div>

            <h1 class="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-6 text-balance text-white"
                [innerHTML]="movie()!.title">
            </h1>

            <div class="prose prose-invert prose-lg text-gray-300 mb-8 max-w-3xl leading-relaxed drop-shadow-md"
                 [innerHTML]="movie()!.overview">
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
              <a [href]="'https://hackstore.mx/peliculas/' + movie()!.slug" target="_blank" class="bg-[#e50914] hover:bg-red-700 text-white font-bold py-3 px-8 rounded flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(229,9,20,0.5)] active:scale-95 text-center text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 shrink-0">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                REPRODUCIR
              </a>
            </div>
          </div>
          
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LazyImageDirective, WpImagePipe, BadgeComponent]
})
export class MovieDetailsComponent {
  // Captured directly from the route param /movie/:id thanks to withComponentInputBinding()
  id = input.required<string>();

  private wpService = inject(WpMediaService);
  private location = inject(Location);
  
  // Router state
  private stateMedia = history.state.media as ApiMedia | undefined;

  // Derive an observable from the input 'id' and fetch the details IF state was empty
  private mediaState = toSignal(
    toObservable(this.id).pipe(
      switchMap(currentId => {
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

  movie = computed(() => this.mediaState()?.data || null);
  hasError = computed(() => this.mediaState()?.error === true);
  loadingOrPending = computed(() => this.mediaState() === undefined && !this.hasError());

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
