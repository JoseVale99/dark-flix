import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'df-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Bottom Sheet Menu for Categories -->
    @if (isCategoriesOpen()) {
      <div class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" (click)="toggleCategories()"></div>
      <div class="fixed bottom-24 left-4 right-4 z-50 bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.9)] p-2 flex flex-col animate-fade-in origin-bottom md:hidden">
        <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 pointer-events-none"></div>
        <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-2 text-center">Explorar DarkFlix</h3>
        
        <a routerLink="/series" routerLinkActive="bg-white/10 text-[#e50914]" (click)="toggleCategories()" class="text-white font-bold text-base md:text-lg p-4 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-white/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>
          </div>
          Series
        </a>
        <a routerLink="/movies" routerLinkActive="bg-white/10 text-[#e50914]" (click)="toggleCategories()" class="text-white font-bold text-base md:text-lg p-4 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-4">
           <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-white/30 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
               <line x1="7" y1="2" x2="7" y2="22" />
               <line x1="17" y1="2" x2="17" y2="22" />
               <line x1="2" y1="12" x2="22" y2="12" />
               <line x1="2" y1="7" x2="7" y2="7" />
               <line x1="2" y1="17" x2="7" y2="17" />
               <line x1="17" y1="17" x2="22" y2="17" />
               <line x1="17" y1="7" x2="22" y2="7" />
             </svg>
          </div>
          Películas
        </a>
        <a routerLink="/animes" routerLinkActive="bg-white/10 text-[#e50914]" (click)="toggleCategories()" class="text-white font-bold text-base md:text-lg p-4 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-4">
           <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-white/30 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          Animes
        </a>
      </div>
    }

    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pt-3 pb-6 px-8 md:hidden">
      <!-- Ahora distribuimos 3 elementos un poco más separados -->
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
          <button (click)="toggleCategories()" 
                  [class.text-[#e50914]]="isCategoriesOpen()"
                  [class.scale-110]="isCategoriesOpen()"
                  [class.drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]]="isCategoriesOpen()"
                  class="flex flex-col items-center gap-1.5 transition-all hover:text-white cursor-pointer -mt-1 relative">
            <div class="w-10 h-10 bg-[#e50914] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.6)] text-white">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            </div>
            <span>Categorías</span>
          </button>
        </li>

        <!-- Tab: Mi Lista -->
        <li>
          <a routerLink="/mi-lista" routerLinkActive="text-[#e50914] scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]" class="flex flex-col items-center gap-1.5 transition-all hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-0.5"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
            <span>Mi Lista</span>
          </a>
        </li>

      </ul>
    </nav>
  `
})
export class BottomNavComponent {
  isCategoriesOpen = signal(false);

  toggleCategories() {
    this.isCategoriesOpen.update(v => !v);
  }
}
