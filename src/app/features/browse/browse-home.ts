import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { WpMediaService } from '@services/wp-media';
import { HeroBannerComponent } from '@shared/components/hero-banner/hero-banner';
import { MediaSliderComponent } from '@shared/components/media-slider/media-slider';
import { ApiMedia } from '@models';

@Component({
  selector: 'df-browse-home',
  template: `
    <div class="min-h-screen w-full bg-df-background pb-20 overflow-x-hidden">
      <!-- Hero Principal (Toma el primer post destacado de Sliders) -->
      <df-hero-banner [featuredPost]="heroPost()" />

      <!-- Carruseles de Categorías -->
      <div class="relative z-20 -mt-8 md:-mt-16 space-y-8 md:space-y-12">
        
        <df-media-slider 
          title="Nuevos Lanzamientos" 
          [mediaItems]="newReleases() || []" 
          [loading]="loading()"
          (mediaSelected)="onMediaSelected($event)" />

        <df-media-slider 
          title="Tendencias" 
          [mediaItems]="trendingPosts() || []" 
          [loading]="loading()"
          (mediaSelected)="onMediaSelected($event)" />

        <df-media-slider 
          title="Selección Exclusiva" 
          [mediaItems]="curatedPosts() || []" 
          [loading]="loading()"
          (mediaSelected)="onMediaSelected($event)" />
          
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeroBannerComponent, MediaSliderComponent]
})
export class BrowseHomeComponent {
  private wpService = inject(WpMediaService);
  private router = inject(Router);

  // Hero y Slider response
  private heroResponse = toSignal(
    this.wpService.getMediaSliders().pipe(
      map(posts => ({ data: posts, error: false })),
      catchError(() => of({ data: null, error: true }))
    ),
    { initialValue: { data: null, error: false } }
  );

  // Movies Catalog response
  private catalogResponse = toSignal(
    this.wpService.getMediaCatalog().pipe(
      map(posts => ({ data: posts, error: false })),
      catchError(() => of({ data: null, error: true }))
    ),
    { initialValue: { data: null, error: false } }
  );

  // Estado Computado
  loading = computed(() => this.catalogResponse().data === null && !this.catalogResponse().error);
  hasError = computed(() => this.catalogResponse().error === true || this.heroResponse().error === true);
  
  // Derivadas para los sliders
  heroPost = computed(() => this.heroResponse().data?.[0]);
  
  // El listado general que devuelve 12 items, se corta para simular categorías
  posts = computed(() => this.catalogResponse().data || []);
  
  newReleases = computed(() => this.posts().slice(0, 4));
  trendingPosts = computed(() => this.posts().slice(4, 9));
  curatedPosts = computed(() => this.posts().slice(9, 12));

  onMediaSelected(media: ApiMedia) {
    void this.router.navigate(['/movie', media._id]);
  }
}
