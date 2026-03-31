import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { WpMediaService } from '../../core/services/wp-media';
import { MediaGridComponent } from '../../shared/components/media-grid/media-grid';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card';

@Component({
  selector: 'df-browse-home',
  template: `
    <div class="min-h-screen bg-df-background text-white pt-20">
      <header class="px-4 md:px-8 mb-6">
        <h1 class="text-3xl font-bold font-sans">DarkFlix Series y Películas</h1>
        <p class="text-df-muted mt-2 text-sm">Catálogo dinámico servido desde WordPress Headless API</p>
      </header>

      <main class="px-4 md:px-8">
        @if (posts() === undefined) {
          <!-- Skeleton Loading visualizándose mientras el observable se resuelve -->
           <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 py-8">
             @for (s of [1,2,3,4,5,6,7,8,9,10,11,12]; track s) {
               <df-skeleton-card />
             }
           </div>
        } @else if (posts()?.length) {
          <!-- Success state: renderizar la grilla inteligente -->
          <df-media-grid [mediaItems]="posts()!" />
        } @else {
          <!-- Error o Empty State (posts resolvió a null o vacio) -->
          <div class="py-20 text-center">
            <h2 class="text-xl text-df-muted font-semibold">No hemos encontrado contenido disponible 🎬</h2>
            <p class="text-sm text-df-muted mt-2">La conexión con el backend o WP REST API falló o el catálogo está vacío.</p>
          </div>
        }
      </main>
    </div>
  `,
  imports: [MediaGridComponent, SkeletonCardComponent]
})
export class BrowseHomeComponent {
  private mediaService = inject(WpMediaService);
  
  // RxJS a Signal bridge, catchError atrapa errores 404/500 derivándolos a 'null'
  posts = toSignal(
    this.mediaService.getMediaCatalog().pipe(
      catchError(() => of(null)) 
    )
  );
}
