import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'df-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pt-3 pb-6 px-6 md:hidden">
      <ul class="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        
        <!-- Tab: Home -->
        <li>
          <a routerLink="/" routerLinkActive="text-[#e50914] scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center gap-1.5 transition-all hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-0.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Inicio</span>
          </a>
        </li>

        <!-- Tab: Categorías -->
        <li>
          <a routerLink="/categories" routerLinkActive="text-[#e50914] scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]" class="flex flex-col items-center gap-1.5 transition-all hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-0.5"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            <span>Buscar</span>
          </a>
        </li>

        <!-- Tab: Downloads -->
        <li>
          <a routerLink="/mi-lista" routerLinkActive="text-[#e50914] scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]" class="flex flex-col items-center gap-1.5 transition-all hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-0.5"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
            <span>Mi Lista</span>
          </a>
        </li>

        <!-- Tab: Profile -->
        <li>
          <a routerLink="/profile" routerLinkActive="text-[#e50914] scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]" class="flex flex-col items-center gap-1.5 transition-all hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-0.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Perfil</span>
          </a>
        </li>

      </ul>
    </nav>
  `
})
export class BottomNavComponent {}
