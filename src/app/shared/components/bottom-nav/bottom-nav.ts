import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'df-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pt-3 pb-6 px-4 md:hidden">
      <ul class="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        
        <!-- Tab 1: Inicio -->
        <li class="flex-1">
          <a routerLink="/" routerLinkActive="text-[#e50914] scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center gap-1.5 transition-all outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-0.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Inicio</span>
          </a>
        </li>

        <!-- Tab 2: Explorar (Directo a Catalog) -->
        <li class="flex-1">
          <a routerLink="/categories" routerLinkActive="text-[#e50914] scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]" class="flex flex-col items-center gap-1.5 transition-all outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-0.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>Explorar</span>
          </a>
        </li>

        <!-- Tab 3: Series (Sustituye Perfil) -->
        <li class="flex-1">
          <a routerLink="/series" routerLinkActive="text-[#e50914] scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]" class="flex flex-col items-center gap-1.5 transition-all outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-0.5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></svg>
            <span>Series</span>
          </a>
        </li>

        <!-- Tab 4: Mi Lista -->
        <li class="flex-1">
          <a routerLink="/mi-lista" routerLinkActive="text-[#e50914] scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]" class="flex flex-col items-center gap-1.5 transition-all outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-0.5"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
            <span>Mi Lista</span>
          </a>
        </li>

      </ul>
    </nav>
  `
})
export class BottomNavComponent {
}
