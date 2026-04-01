import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { WpMediaService } from '@services/wp-media';
import { HeroBannerComponent } from '@shared/components/hero-banner/hero-banner';
import { MediaSliderComponent } from '@shared/components/media-slider/media-slider';
import { WpPost } from '@models/wp-post.model';


@Component({
  selector: 'df-browse-home',
  template: `
    <div class="h-full w-full pb-20 overflow-x-hidden">
      <!-- 1. El Estado de Error si todo truena a nivel HTTP -->
      @if (hasError()) {
        <div class="flex items-center justify-center h-64 text-red-500 bg-df-card/50 mx-4 my-8 rounded">
          <p class="font-semibold px-4 text-center">
            Error de conexión a la Base Madre.
            <br/><span class="text-sm font-normal text-df-muted">La red parece comprometida.</span>
          </p>
        </div>
      }

      <!-- 2. Hero Banner principal -->
      <!-- Ocupa un espacio central majestuoso. Si posts() está vacío/nulo, inyecta 'undefined' y renderiza el layout placeholder -->
      <df-hero-banner [featuredPost]="heroPost()" />

      <!-- 3. Carruseles / Filas de Contenido -->
      <!-- Las empujamos sutilmente hacia arriba con un -mt para sobreponerlas en el gradiente del Hero -->
      <div class="relative z-10 -mt-10 md:-mt-24 space-y-6">
        <df-media-slider
          title="Tendencias"
          [isLoading]="loadingOrPending()"
          [mediaItems]="trendingPosts()"
          (mediaSelected)="onMediaSelected($event)"
        />

        <df-media-slider
          title="Nuevos Lanzamientos"
          [isLoading]="loadingOrPending()"
          [mediaItems]="newReleasesPosts()"
          (mediaSelected)="onMediaSelected($event)"
        />

        <df-media-slider
          title="Nuestra Selección"
          [isLoading]="loadingOrPending()"
          [mediaItems]="curatedPosts()"
          (mediaSelected)="onMediaSelected($event)"
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeroBannerComponent, MediaSliderComponent]
})
export class BrowseHomeComponent {
  private wpService = inject(WpMediaService);
  private router = inject(Router);

  // Derivamos un stream capturando status desde el Request original simulando una PWA
  // toSignal lo empalma al árbol de reactividad Signal a nivel Root
  private postsState = toSignal(
    this.wpService.getMediaCatalog().pipe(
      map(posts => ({ data: posts, error: false })),
      catchError(() => of({ data: null, error: true }))
    ),
    { initialValue: undefined } // undefined = pending request network state
  );

  // Señal calculada de conveniencia que extrae estrictamente los posts o vacío
  posts = computed(() => this.postsState()?.data || []);

  /**
   * Extraemos falsas rebanadas de array para simular "categorías"
   * ya que Hackstore escupe posts lineales desde el RestAPI base sin filtro.
   */
  heroPost = computed(() => this.posts()[0]); // Slot 0
  trendingPosts = computed(() => this.posts().slice(1, 4)); // Slot 1 al 3
  newReleasesPosts = computed(() => this.posts().slice(4, 7)); // Slot 4 al 6
  curatedPosts = computed(() => this.posts().slice(7, 10)); // Restantes

  // Signals reactivos puros para la UI (Skeletization y Feedback)
  hasError = computed(() => this.postsState()?.error === true);
  // Pendiente/cargando es verdadero SOLO cuando la Signal principal ni siquiera emitió un `{}` (su InitialValue)
  loadingOrPending = computed(() => this.postsState() === undefined && !this.hasError());

  /**
   * Navegación imperativa visual al detalle
   */
  onMediaSelected(post: WpPost) {
    this.router.navigate(['/movie', post.id]);
  }
}
