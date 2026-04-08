import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { WpMediaService } from '@services/wp-media';
import { MediaGridComponent } from '@shared/components/media-grid/media-grid';
import { ApiMedia } from '@models';
import { switchMap, map, catchError, of, tap, debounceTime } from 'rxjs';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';

@Component({
  selector: 'df-search-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MediaGridComponent],
  providers: [MediaUrlPipe],
  template: `
    <div class="max-w-400 mx-auto px-4 md:px-8 pt-8 pb-20 md:mt-8 min-h-[70vh]">
      @if (loading()) {
        <div class="flex items-center justify-center py-32">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-df-accent"></div>
        </div>
      } @else {
        @if (searchQuery()) {
          <h1 class="text-2xl md:text-3xl font-bold mb-8">
            Resultados para: <span class="text-gray-400">"{{ searchQuery() }}"</span>
          </h1>
        }

        <df-media-grid 
          [title]="''" 
          [mediaItems]="searchResults() || []" 
          (mediaSelected)="onMediaSelected($event)" />

        @if (!loading() && searchQuery() && (!searchResults() || searchResults().length === 0)) {
           <div class="text-center py-20">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <p class="text-xl text-gray-400">No encontramos coincidencias para tu búsqueda.</p>
             <p class="text-sm text-gray-600 mt-2">Intenta buscar usando otras palabras clave o el título de la película.</p>
           </div>
        }
        
        @if (!searchQuery()) {
            <div class="text-center py-20 flex flex-col items-center justify-center h-[50vh]">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-600 mb-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
               <h2 class="text-3xl font-bold text-gray-400">¿Qué te gustaría ver hoy?</h2>
               <p class="text-gray-500 mt-4 text-lg">Escribe en la barra superior para descubrir contenido espectacular.</p>
            </div>
        }
      }
    </div>
  `
})
export class SearchViewComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private wpService = inject(WpMediaService);
  private mediaUrlPipe = inject(MediaUrlPipe); // Usar inyección de provider

  searchQuery = signal<string>('');
  loading = signal<boolean>(false);

  searchResults = toSignal(
    this.route.queryParams.pipe(
      map(params => params['q'] || ''),
      tap(query => {
        this.searchQuery.set(query);
        if (query) this.loading.set(true);
      }),
      debounceTime(400), // Evitamos hacer peticiones a cada milisegundo que el usuario escribe
      switchMap(query => {
        if (!query) {
          this.loading.set(false);
          return of([]);
        }
        return this.wpService.searchMedia(query).pipe(
          tap(() => this.loading.set(false)),
          catchError(() => {
            this.loading.set(false);
            return of([]);
          })
        );
      })
    ), { initialValue: [] }
  );

  onMediaSelected(media: ApiMedia) {
    const url = this.mediaUrlPipe.transform(media);
    // Angular router link format is array of strings based on segments
    // Since mediaUrlPipe returns something like "/peliculas/batman-azteca", we split and filter out empty strings
    const segments = url.split('/').filter(s => s !== '');
    this.router.navigate(['/', ...segments], { state: { media } });
  }
}
