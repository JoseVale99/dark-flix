import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiMedia } from '@models';
import { LazyImageDirective } from '@shared/directives/lazy-image';
import { WpImagePipe } from '@shared/pipes/wp-image';
import { BadgeComponent } from '@shared/components/badge/badge';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';

@Component({
  selector: 'df-hero-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LazyImageDirective, WpImagePipe, BadgeComponent, MediaUrlPipe],
  template: `
    <div class="relative w-full h-[75vh] md:h-[85vh] flex flex-col justify-center overflow-hidden px-4 md:px-20 mb-8 md:mb-12 border-b border-gray-800">

      <!-- Capa 1: Fondo atmosférico (Súper desenfocado para disimular backdrops baja res) -->
      @if (featuredPost()) {
        <img
          dfLazyImage
          [lazySrc]="featuredPost() | wpImage:'backdrop'"
          class="absolute inset-0 w-full h-full object-cover z-0 blur-[60px] md:blur-[100px] scale-150 opacity-50 mix-blend-screen"
          alt="Atmosphere">
      }

      <!-- Dimmer general y Gradiente base -->
      <div class="absolute inset-0 bg-black/60 z-0"></div>
      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-df-background via-df-background/80 to-transparent z-0"></div>

      <!-- Contenedor Principal (Grid/Flex) -->
      <div class="relative z-20 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto pt-10 md:pt-20 gap-8 md:gap-4">

        <!-- Mitad Izquierda: Contenido (Logo/Text/CTA) -->
        <div class="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <div class="flex items-center gap-2 mb-4">
            <df-badge variant="accent" text="TOP HIT" />
            <span class="text-xs md:text-sm tracking-widest text-[#e50914] font-bold drop-shadow-md shadow-black">TENDENCIA MUNDIAL</span>
          </div>

          @if (featuredPost()?.images?.logo) {
            <img
              [src]="featuredPost() | wpImage:'logo'"
              [alt]="featuredPost()?.title"
              class="w-full max-w-62.5 md:max-w-md h-auto mb-6 object-contain drop-shadow-2xl"
              loading="eager"
            />
          } @else {
            <h1 class="text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-none mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                [innerHTML]="featuredPost()?.title || 'EXCLUSIVA MUNDIAL'">
            </h1>
          }

          <p class="text-gray-200 text-sm md:text-lg lg:text-xl font-medium mb-8 line-clamp-3 md:line-clamp-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] max-w-xl">
            {{ featuredPost()?.overview || 'Sinopsis no disponible en este momento.' }}
          </p>

          <div class="flex flex-wrap justify-center md:justify-start gap-4 w-full">
            <button [routerLink]="featuredPost() | mediaUrl" [state]="{ media: featuredPost() }" class="bg-[#e50914] hover:bg-red-700 text-white font-bold py-3 md:py-4 px-8 md:px-12 rounded flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(229,9,20,0.4)] text-lg cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M5 3l14 9-14 9V3z"/></svg>
              REPRODUCIR
            </button>
            <button [routerLink]="featuredPost() | mediaUrl" [state]="{ media: featuredPost() }" class="bg-gray-500/30 hover:bg-gray-500/50 backdrop-blur-md border border-white/10 text-white font-bold py-3 md:py-4 px-8 md:px-10 rounded transition-colors flex justify-center items-center text-lg gap-2 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
              MÁS INFO
            </button>
          </div>
        </div>

        <!-- Mitad Derecha: Arte en Alta Definición (Póster principal en perspectiva) -->
        <div class="hidden lg:flex w-full md:w-1/2 h-full items-center justify-center relative perspective-[1000px]">
          @if (featuredPost()) {
             <div class="relative w-[320px] xl:w-100 aspect-poster rounded-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] transform rotate-y-[-15deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 hover:scale-[1.02] transition-all duration-800 ring-1 ring-white/10 cursor-pointer">
                <img
                  dfLazyImage
                  [lazySrc]="featuredPost() | wpImage:'poster'"
                  class="w-full h-full object-cover"
                  [alt]="featuredPost()?.title">
                <!-- Brillo volumétrico -->
                <div class="absolute inset-0 bg-linear-to-tr from-black/50 via-transparent to-white/10 mix-blend-overlay"></div>
             </div>
          }
        </div>
      </div>
    </div>
  `
})
export class HeroBannerComponent {
  featuredPost = input<ApiMedia | undefined>();
}
