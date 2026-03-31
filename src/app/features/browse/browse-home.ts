import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { WpMediaService } from '../../core/services/wp-media';
import { MediaGridComponent } from '../../shared/components/media-grid/media-grid';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner';

@Component({
  selector: 'df-browse-home',
  template: `
    <div class="bg-df-background text-white w-full">
      <!-- Mega Hero Banner alimentado por el Post más reciente (índice 0) -->
      @if (posts()?.length) {
        <df-hero-banner [featuredPost]="posts()![0]" />
      } @else if (posts() === undefined) {
        <div class="w-full h-[75vh] md:h-[85vh] bg-df-card animate-shimmer"></div>
      }

      <main class="px-4 md:px-12 -mt-16 md:-mt-20 relative z-30">
        <h2 class="text-xl md:text-2xl font-bold mb-4 px-2">Trending Now</h2>
        
        @if (posts() === undefined) {
           <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-20">
             @for (s of [1,2,3,4,5,6]; track s) {
               <df-skeleton-card />
             }
           </div>
        } @else if (posts()?.length) {
          <!-- Por defecto limitaremos el render de la grilla exceptuando el que ya fue destacada en Hero -->
          <df-media-grid [mediaItems]="posts()!.slice(1)" />
        } @else {
          <div class="py-20 text-center">
            <h2 class="text-xl text-df-muted font-semibold">No hemos encontrado contenido disponible 🎬</h2>
            <p class="text-sm text-df-muted mt-2">La conexión con el backend falló o el catálogo está vacío.</p>
          </div>
        }
      </main>
    </div>
  `,
  imports: [MediaGridComponent, SkeletonCardComponent, HeroBannerComponent]
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
