import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { WpMediaService } from '@services/wp-media';
import { WatchHistoryService } from '@services/watch-history';
import { HeroBannerComponent } from '@shared/components/hero-banner/hero-banner';
import { MediaSliderComponent } from '@shared/components/media-slider/media-slider';
import { ApiMedia } from '@models';

@Component({
  selector: 'df-browse-home',
  template: `
    <div class="min-h-screen w-full bg-df-background pb-20 overflow-x-hidden">
      <!-- Hero Principal -->
      <df-hero-banner [featuredPost]="heroPost()" />

      <!-- Carruseles Verdaderos Segmentados -->
      <div class="relative z-20 -mt-8 md:-mt-16 space-y-8 md:space-y-12">

        @if (watchHistory().length > 0) {
          <df-media-slider
            title="Vistos Recientemente"
            [mediaItems]="watchHistory()"
            [loading]="false"
            (mediaSelected)="onMediaSelected($event)" />
        }

        <df-media-slider
          title="Películas Recientes"
          [mediaItems]="moviesResponse().data || []"
          [loading]="moviesResponse().loading"
          (mediaSelected)="onMediaSelected($event)" />

        <df-media-slider
          title="Series Destacadas"
          [mediaItems]="tvShowsResponse().data || []"
          [loading]="tvShowsResponse().loading"
          (mediaSelected)="onMediaSelected($event)" />

        <df-media-slider
          title="Animes Populares"
          [mediaItems]="animesResponse().data || []"
          [loading]="animesResponse().loading"
          (mediaSelected)="onMediaSelected($event)" />

      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroBannerComponent, MediaSliderComponent]
})
export class BrowseHomeComponent {
  private wpService = inject(WpMediaService);
  private router = inject(Router);
  private watchHistoryService = inject(WatchHistoryService);

  public watchHistory = this.watchHistoryService.history;

  private heroResponse = toSignal(
    this.wpService.getMediaSliders().pipe(
      map(posts => {
        if (!posts || posts.length === 0) return { data: undefined, error: false };
        const randomFeatured = posts[Math.floor(Math.random() * posts.length)];
        return { data: randomFeatured, error: false };
      }),
      catchError(() => of({ data: undefined as ApiMedia | undefined, error: true }))
    ),
    { initialValue: { data: undefined as ApiMedia | undefined, error: false } }
  );

  moviesResponse = toSignal(
    this.wpService.getMoviesList().pipe(
        map(posts => ({ data: posts, error: false, loading: false })),
        catchError(() => of({ data: null, error: true, loading: false }))
    ),
    { initialValue: { data: [], error: false, loading: true } }
  );

  tvShowsResponse = toSignal(
    this.wpService.getTvShowsList().pipe(
        map(posts => ({ data: posts, error: false, loading: false })),
        catchError(() => of({ data: null, error: true, loading: false }))
    ),
    { initialValue: { data: [], error: false, loading: true } }
  );

  animesResponse = toSignal(
    this.wpService.getAnimesList().pipe(
        map(posts => ({ data: posts, error: false, loading: false })),
        catchError(() => of({ data: null, error: true, loading: false }))
    ),
    { initialValue: { data: [], error: false, loading: true } }
  );

  heroPost = computed(() => this.heroResponse().data);

  onMediaSelected(media: ApiMedia) {
    let prefix = 'peliculas';
    if (media.type === 'tvshows') prefix = 'series';
    else if (media.type === 'animes') prefix = 'animes';

    void this.router.navigate(['/' + prefix, media.slug], { state: { media } });
  }
}
