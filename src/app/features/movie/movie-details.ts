import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WpMediaService } from '@services/wp-media';
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
        <!-- Backdrop Hero -->
        <div class="relative w-full h-[60vh] md:h-[75vh]">
          <img dfLazyImage [lazySrc]="movie()! | wpImage:'backdrop'" class="w-full h-full object-cover" alt="Backdrop">
          <div class="absolute inset-0 bg-linear-to-b from-transparent via-df-background/60 to-df-background"></div>
          <div class="absolute inset-0 bg-linear-to-r from-df-background/90 via-df-background/40 to-transparent hidden md:block"></div>
          
          <button (click)="goBack()" class="absolute top-6 left-4 md:left-12 z-50 text-white/80 hover:text-white bg-black/40 hover:bg-black/80 rounded-full p-2 backdrop-blur-sm transition-all focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="relative z-10 -mt-20 md:-mt-40 px-4 md:px-12 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
          
          <!-- Left Column: Poster -->
          <div class="hidden md:block w-1/4 shrink-0">
            <div class="aspect-poster rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10">
              <img dfLazyImage [lazySrc]="movie()! | wpImage:'poster'" class="w-full h-full object-cover" alt="Poster">
            </div>
          </div>

          <!-- Right Column: Info -->
          <div class="flex-1 text-white pt-4">
            <div class="flex flex-wrap gap-2 mb-4">
              @if (getQuality()) {
                <df-badge [text]="getQuality()!" variant="accent" />
              }
              @if (getYear()) {
                <df-badge [text]="getYear()!" variant="default" />
              }
              <df-badge text="Cinematic" variant="default" />
            </div>

            <h1 class="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6 text-balance drop-shadow-lg"
                [innerHTML]="movie()!.title">
            </h1>

            <div class="prose prose-invert prose-lg text-gray-300 mb-8 max-w-3xl leading-relaxed"
                 [innerHTML]="movie()!.overview">
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
              <a [href]="'https://hackstore.mx/peliculas/' + movie()!.slug" target="_blank" class="bg-df-accent hover:bg-red-700 text-white font-bold py-3 px-8 rounded flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(229,9,20,0.5)] active:scale-95 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 shrink-0">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                DESCARGAR DE ORIGEN
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

  // Derive an observable from the input 'id' and fetch the details
  private mediaState = toSignal(
    toObservable(this.id).pipe(
      switchMap(currentId => this.wpService.getMediaById(currentId).pipe(
        map(post => ({ data: post, error: false })),
        catchError(() => of({ data: null, error: true }))
      ))
    ),
    { initialValue: undefined }
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
