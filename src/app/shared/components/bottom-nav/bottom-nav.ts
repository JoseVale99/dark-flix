import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'df-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-md border-t border-white/5 py-3 px-6 md:hidden">
      <ul class="flex justify-between items-center text-xs font-medium text-df-muted">
        
        <!-- Tab: Home -->
        <li>
          <a routerLink="/" routerLinkActive="text-df-accent" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center gap-1 transition-colors hover:text-white">
            <svg xmlns="http://www.w3.org/O/svg/2000" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Home</span>
          </a>
        </li>

        <!-- Tab: Categorías -->
        <li>
          <a routerLink="/categories" routerLinkActive="text-df-accent" class="flex flex-col items-center gap-1 transition-colors hover:text-white">
            <svg xmlns="http://www.w3.org/O/svg/2000" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            <span>Categorías</span>
          </a>
        </li>

        <!-- Tab: Downloads -->
        <li>
          <a routerLink="/downloads" routerLinkActive="text-df-accent" class="flex flex-col items-center gap-1 transition-colors hover:text-white">
            <svg xmlns="http://www.w3.org/O/svg/2000" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span>Descargas</span>
          </a>
        </li>

        <!-- Tab: Profile -->
        <li>
          <a routerLink="/profile" routerLinkActive="text-df-accent" class="flex flex-col items-center gap-1 transition-colors hover:text-white">
            <svg xmlns="http://www.w3.org/O/svg/2000" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Perfil</span>
          </a>
        </li>

      </ul>
    </nav>
  `
})
export class BottomNavComponent {}
