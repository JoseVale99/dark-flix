import {
  ChangeDetectionStrategy,
  Component,
  input,
  inject,
  computed,
  signal,
  afterNextRender,
  PLATFORM_ID,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { ApiMedia } from '@models';
import { LazyImageDirective } from '@shared/directives/lazy-image';
import { WpImagePipe } from '@shared/pipes/wp-image';
import { BadgeComponent } from '@shared/components/badge/badge';
import { PosterPlaceholderComponent } from '@shared/components/poster-placeholder/poster-placeholder';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';
import { I18nService } from '@core/i18n/i18n.service';

@Component({
  selector: 'df-hero-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LazyImageDirective,
    WpImagePipe,
    BadgeComponent,
    MediaUrlPipe,
    PosterPlaceholderComponent,
  ],
  template: `
    <div
      class="relative w-full h-[75vh] md:h-[85vh] flex flex-col justify-center overflow-hidden px-4 md:px-20 mb-8 md:mb-12 border-b border-gray-800"
    >
      <!-- Capa 1: Fondo atmosférico (Súper desenfocado para disimular backdrops baja res) -->
      @if (featuredPost() && !trailerReady() && backdropUrl()) {
        <img
          dfLazyImage
          [lazySrc]="backdropUrl()"
          class="absolute inset-0 w-full h-full object-cover z-0 blur-[60px] md:blur-[100px] scale-150 opacity-50 mix-blend-screen"
          alt="Atmosphere"
        />
      }

      <!-- Capa 2: Imagen real de fondo (siempre visible hasta que el vídeo esté listo) -->
      @if (featuredPost() && !trailerReady() && backdropUrl()) {
        <img
          dfLazyImage
          [lazySrc]="backdropUrl()"
          class="absolute inset-0 w-full h-full object-cover object-top z-1 opacity-60"
          alt="Backdrop"
        />
      }

      <!-- Capa 2b: Trailer de YouTube — solo desktop, solo tras 2 seg de delay -->
      @if (trailerReady() && trailerUrl()) {
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black">
          <iframe
            [src]="trailerUrl()"
            class="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-70"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
          >
          </iframe>
        </div>
      }

      <!-- Dimmer general y Gradiente base -->
      <div
        class="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-df-background via-df-background/70 to-transparent z-2"
      ></div>
      <div
        class="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-black/60 to-transparent z-2 pointer-events-none"
      ></div>

      <!-- Contenedor Principal (Grid/Flex) -->
      <div
        class="relative z-20 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto pt-10 md:pt-20 gap-8 md:gap-4"
      >
        <!-- Mitad Izquierda: Contenido (Logo/Text/CTA) -->
        <div
          class="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left"
        >
          <div class="flex items-center gap-2 mb-4">
            <df-badge variant="accent" [text]="i18n.t('hero.topHit')" />
            <span
              class="text-xs md:text-sm tracking-widest text-df-accent font-bold drop-shadow-md shadow-black"
              >{{ i18n.t('hero.trending') }}</span
            >
          </div>

          @if (featuredPost()?.images?.logo) {
            <img
              [src]="featuredPost() | wpImage: 'logo'"
              [alt]="$safeNavigationMigration(featuredPost()?.title)"
              class="w-full max-w-62.5 md:max-w-md h-auto mb-6 object-contain drop-shadow-2xl"
              loading="eager"
            />
          } @else {
            <h1
              class="text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-none mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
              [innerHTML]="featuredPost()?.title || i18n.t('hero.worldExclusive')"
            ></h1>
          }

          <p
            class="text-gray-200 text-sm md:text-lg lg:text-xl font-medium mb-8 line-clamp-3 md:line-clamp-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] max-w-xl"
          >
            {{ featuredPost()?.overview || i18n.t('hero.noSynopsis') }}
          </p>

          <div class="flex flex-wrap justify-center md:justify-start gap-4 w-full">
            <a
              [routerLink]="featuredPost() | mediaUrl"
              [state]="{ media: featuredPost() }"
              class="bg-df-accent hover:bg-df-accent-dark text-white font-bold py-3 md:py-4 px-8 md:px-12 rounded flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-df-glow text-lg cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-6 h-6"
              >
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              {{ i18n.t('hero.play') }}
            </a>
            <a
              [routerLink]="featuredPost() | mediaUrl"
              [state]="{ media: featuredPost() }"
              class="bg-gray-500/30 hover:bg-gray-500/50 backdrop-blur-md border border-white/10 text-white font-bold py-3 md:py-4 px-8 md:px-10 rounded transition-colors flex justify-center items-center text-lg gap-2 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
              {{ i18n.t('hero.moreInfo') }}
            </a>
          </div>
        </div>

        <!-- Mitad Derecha: Arte en Alta Definición (Póster principal en perspectiva) -->
        <div
          class="hidden lg:flex w-full md:w-1/2 h-full items-center justify-center relative perspective-[1000px]"
        >
          @if (featuredPost()) {
            @if (hasPosterArt()) {
              <a
                [routerLink]="featuredPost() | mediaUrl"
                [state]="{ media: featuredPost() }"
                class="group/hero-poster relative block w-[320px] xl:w-100 aspect-poster rounded-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] transform rotate-y-[-15deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 hover:scale-[1.02] transition-all duration-800 ring-1 ring-white/10 cursor-pointer"
              >
                <img
                  dfLazyImage
                  [lazySrc]="posterUrl()"
                  (error)="onPosterError()"
                  class="w-full h-full object-cover"
                  [alt]="$safeNavigationMigration(featuredPost()?.title)"
                />
                <!-- Brillo volumétrico -->
                <div
                  class="absolute inset-0 bg-linear-to-tr from-black/50 via-transparent to-white/10 mix-blend-overlay"
                ></div>
              </a>
            } @else {
              <a
                [routerLink]="featuredPost() | mediaUrl"
                [state]="{ media: featuredPost() }"
                class="relative block w-[320px] xl:w-100 aspect-poster rounded-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] transform rotate-y-[-15deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 hover:scale-[1.02] transition-all duration-800 ring-1 ring-white/10 cursor-pointer"
              >
                <df-poster-placeholder [title]="featuredPost()?.title || ''" />
              </a>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class HeroBannerComponent {
  public readonly i18n = inject(I18nService);
  featuredPost = input<ApiMedia | undefined>();
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private readonly wpImage = new WpImagePipe();

  backdropUrl = computed(() => this.wpImage.transform(this.featuredPost(), 'backdrop'));

  /** Poster actual; vacío si no existe o si la imagen falló al cargar. */
  posterUrl = computed(() =>
    this.posterFailedId() === this.featuredPost()?._id
      ? ''
      : this.wpImage.transform(this.featuredPost(), 'poster'),
  );

  hasPosterArt = computed(() => !!this.posterUrl());

  posterFailedId = signal<string | number | null>(null);

  onPosterError(): void {
    this.posterFailedId.set(this.featuredPost()?._id ?? null);
  }

  /** Se activa solo en desktop tras 2 segundos de delay para no bloquear el primer render */
  trailerReady = signal(false);

  constructor() {
    afterNextRender(() => {
      // Solo en desktop (md breakpoint = 768px) para no gastar datos móviles
      if (!isPlatformBrowser(this.platformId)) return;
      if (window.matchMedia('(min-width: 768px)').matches) {
        setTimeout(() => this.trailerReady.set(true), 2000);
      }
    });
  }

  trailerUrl = computed(() => {
    const post = this.featuredPost();
    if (!post || !post.trailer) return null;

    // Si el trailer ya es un ID directo de 11 caracteres (ej. "hiD3zk0ZRFg")
    let videoId = '';
    if (post.trailer.length === 11 && !post.trailer.includes('/')) {
      videoId = post.trailer;
    } else {
      // Buscar si es URL completa de YouTube
      const match = post.trailer.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/,
      );
      if (match && match[1]) {
        videoId = match[1];
      }
    }

    if (videoId) {
      // URL de YouTube optimizada para Background
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&modestbranding=1&playsinline=1&iv_load_policy=3`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }

    return null;
  });
}
