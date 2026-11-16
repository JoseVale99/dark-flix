import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Portada genérica para contenidos sin imagen (o cuya imagen falló).
 * Se usa en tarjetas, hero y fichas para mantener una estética consistente.
 */
@Component({
  selector: 'df-poster-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#0d0d0d] select-none"
    >
      <!-- Trama de puntos sutil -->
      <div
        class="absolute inset-0 opacity-[0.07]"
        style="background-image: radial-gradient(circle at 1px 1px, #fff 1px, transparent 0); background-size: 12px 12px"
      ></div>

      <!-- Resplandor rojo inferior -->
      <div
        class="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-[#e50914]/25 via-[#e50914]/5 to-transparent"
      ></div>

      <!-- Marco con play -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        class="relative w-11 h-11 md:w-14 md:h-14 text-white/25"
      >
        <rect x="2.25" y="4.75" width="19.5" height="14.5" rx="2.25" />
        <path d="M10 9.6l4.6 2.4-4.6 2.4V9.6z" fill="currentColor" stroke="none" />
      </svg>

      <p
        class="relative mt-3 px-4 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-[0.22em] text-white/35"
      >
        Sin portada
      </p>

      @if (title()) {
        <p
          class="relative mt-1.5 px-4 text-center text-[11px] md:text-sm font-bold leading-snug text-white/65 line-clamp-3"
        >
          {{ title() }}
        </p>
      }
    </div>
  `,
})
export class PosterPlaceholderComponent {
  /** Título opcional mostrado dentro del placeholder. */
  title = input<string>('');
}
