import { ChangeDetectionStrategy, Component, signal, inject, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'df-top-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
         [class.bg-[#141414]]="isScrolled() || isSearchActive()"
         [class.shadow-lg]="isScrolled() || isSearchActive()"
         [class.py-4]="!isScrolled() && !isSearchActive()"
         [class.py-2]="isScrolled() || isSearchActive()"
         [class.bg-gradient-to-b]="!isScrolled() && !isSearchActive()"
         [class.from-black]="!isScrolled() && !isSearchActive()"
         [class.to-transparent]="!isScrolled() && !isSearchActive()">
         
      <div class="max-w-400 mx-auto px-4 md:px-8 flex items-center justify-between">
        
        <!-- Logo -->
        <a routerLink="/" class="flex flex-col select-none cursor-pointer group">
          <h1 class="text-2xl md:text-3xl font-black tracking-tighter" style="font-family: 'Outfit', sans-serif;">
            <span class="text-white group-hover:text-gray-300 transition-colors">DARK</span><span class="text-[#e50914]">FLIX</span>
          </h1>
        </a>

        <!-- Desktop Global Navigation (Optional, can hide on mobile) -->
        <div class="hidden lg:flex items-center gap-6 ml-10 flex-1 text-sm font-semibold text-gray-300">
          <a routerLink="/" class="hover:text-white transition-colors cursor-pointer">Inicio</a>
          <a routerLink="/series" class="hover:text-white transition-colors cursor-pointer">Series</a>
          <a routerLink="/movies" class="hover:text-white transition-colors cursor-pointer">Películas</a>
          <a routerLink="/animes" class="hover:text-white transition-colors cursor-pointer">Animes</a>
          <a routerLink="/categories" class="hover:text-white transition-colors cursor-pointer">Mi Lista</a>
        </div>

        <!-- Right Side: Search & Profile -->
        <div class="flex items-center gap-4 md:gap-6 ml-auto">
          
          <!-- Lupa Animada y Buscador -->
          <div class="relative flex items-center justify-end"
               [class.w-10]="!isSearchActive()"
               [class.w-full]="isSearchActive()"
               [class.sm:w-64]="isSearchActive()"
               class="transition-all duration-300 ease-in-out">
               
               <svg xmlns="http://www.w3.org/2000/svg" 
                    (click)="toggleSearch()"
                    fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" 
                    class="w-6 h-6 text-white cursor-pointer absolute right-2 z-10 hover:text-df-accent transition-colors">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
               </svg>

               <input #searchInput
                      type="text" 
                      [(ngModel)]="searchQuery"
                      (ngModelChange)="onSearchInput($event)"
                      (blur)="onSearchBlur()"
                      [class.opacity-0]="!isSearchActive()"
                      [class.pointer-events-none]="!isSearchActive()"
                      [class.opacity-100]="isSearchActive()"
                      placeholder="Títulos, personas, géneros"
                      class="pl-4 pr-10 py-1.5 bg-black/60 border border-white/30 text-white rounded focus:outline-none focus:border-white focus:bg-black w-full text-sm placeholder-gray-400 transition-all duration-300">
          </div>
          
          <!-- Avatar (Desktop Only) -->
          <div class="hidden sm:block cursor-pointer hover:opacity-80 transition-opacity">
            <div class="w-8 h-8 bg-linear-to-tr from-purple-500 to-df-accent rounded-sm"></div>
          </div>
        </div>

      </div>
    </nav>
  `
})
export class TopNavComponent {
  private router = inject(Router);
  
  isScrolled = signal(false);
  isSearchActive = signal(false);
  searchQuery = signal('');

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor() {
    // Listen to scroll events to alter navbar styling (Netflix-like)
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 0);
      });
    }

    // Reset properties on navigation to home
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url === '/' || !event.url.includes('/search')) {
         // Auto-close if we navigate out of search without text
         if (this.searchQuery() === '') {
           this.isSearchActive.set(false);
         }
      }
    });
  }

  toggleSearch() {
    this.isSearchActive.update(v => !v);
    if (this.isSearchActive()) {
      setTimeout(() => this.searchInput.nativeElement.focus(), 100);
    } else {
      if (this.searchQuery() !== '') {
        this.searchQuery.set('');
        this.router.navigate(['/']); // optional: retreat to home if clearing all
      }
    }
  }

  onSearchInput(query: string) {
    this.searchQuery.set(query);
    if (query.trim().length > 0) {
      // Navigate to /search and push the query as a parameter
      this.router.navigate(['/search'], { queryParams: { q: query } });
    } else {
      this.router.navigate(['/']);
    }
  }

  onSearchBlur() {
    // Hide search bar if it's empty and we clicked outside
    if (this.searchQuery().trim() === '') {
      this.isSearchActive.set(false);
    }
  }
}
