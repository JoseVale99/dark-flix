import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiMedia } from '@models';
import { LazyImageDirective } from '@shared/directives/lazy-image';
import { WpImagePipe } from '@shared/pipes/wp-image';
import { BadgeComponent } from '@shared/components/badge/badge';

@Component({
  selector: 'df-hero-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LazyImageDirective, WpImagePipe, BadgeComponent],
  template: `
    <div class="relative w-full h-[75vh] md:h-[85vh] flex flex-col justify-end pb-24 md:pb-32 px-4 md:px-12 object-cover">
      
      <!-- Fondo Hero Image (Parallax/Cover) -->
      @if (featuredPost()) {
        <img 
          dfLazyImage 
          [lazySrc]="featuredPost() | wpImage:'backdrop'" 
          class="absolute inset-0 w-full h-full object-cover z-0"
          alt="Featured Show Poster">
      }

      <!-- Gradientes (Fade to DarkFlix Background) -->
      <div class="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-df-background via-df-background/80 to-transparent z-10"></div>
      
      <!-- Viñeta Lateral para desktop -->
      <div class="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-df-background via-df-background/60 to-transparent z-10 hidden md:block"></div>

      <!-- Contenido Destacado Texto y Título Frontal -->
      <div class="relative z-20 max-w-2xl">
        <div class="flex items-center gap-2 mb-3">
          <df-badge variant="accent" text="ORIGINAL SERIES" />
          <span class="text-xs md:text-sm tracking-widest text-amber-500 font-bold drop-shadow-md">PREMIUM EXCLUSIVE</span>
        </div>

        @if (featuredPost()?.images?.logo) {
          <img 
            [src]="featuredPost() | wpImage:'logo'" 
            [alt]="featuredPost()?.title"
            class="w-full max-w-[250px] md:max-w-md h-auto mb-6 object-contain drop-shadow-2xl"
            loading="eager"
          />
        } @else {
          <h1 class="text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-none mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
              [innerHTML]="featuredPost()?.title || 'NEON ECLIPSE'">
          </h1>
        }

        <p class="text-gray-200 text-sm md:text-lg lg:text-xl font-medium md:max-w-xl mb-8 line-clamp-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-relaxed">
          {{ featuredPost()?.overview || 'In a decaying metropolis governed by neural-networks, one rogue technician discovers a frequency that could reboot humanity.' }}
        </p>

        <!-- CTAs Base - "Watch Now" y "More Info" -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button [routerLink]="['/movie', featuredPost()?._id]" class="bg-df-accent hover:bg-red-700 text-white font-bold py-3 px-8 rounded flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(229,9,20,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M5 3l14 9-14 9V3z"/></svg>
            PLAY NOW
          </button>
          
          <button [routerLink]="['/movie', featuredPost()?._id]" class="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold py-3 px-8 rounded transition-colors flex justify-center items-center">
            MORE INFO
          </button>
        </div>
      </div>
    </div>
  `
})
export class HeroBannerComponent {
  featuredPost = input<ApiMedia | undefined>();
}
