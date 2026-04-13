import { ChangeDetectionStrategy, Component, signal, PLATFORM_ID, inject, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'df-pwa-install-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div [class.bottom-6]="isProfilesPage()"
           [class.bottom-20]="!isProfilesPage()"
           class="fixed left-1/2 -translate-x-1/2 z-250 w-[calc(100%-2rem)] max-w-md
                  bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl
                  flex items-center gap-4 px-5 py-4 animate-fade-in">

        <!-- Logo / Ícono -->
        <div class="shrink-0 w-12 h-12 bg-[#e50914] rounded-xl flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>

        <!-- Texto -->
        <div class="flex-1 min-w-0">
          <p class="text-white font-bold text-sm leading-tight">Instalar DarkFlix</p>
          <p class="text-gray-400 text-xs mt-0.5 leading-tight">Acceso rápido desde tu pantalla de inicio, sin navegador</p>
        </div>

        <!-- Botones -->
        <div class="flex flex-col gap-1.5 shrink-0">
          <button (click)="install()"
                  class="bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow">
            Instalar
          </button>
          <button (click)="dismiss()"
                  class="text-gray-500 hover:text-white text-xs text-center transition-colors cursor-pointer">
            Ahora no
          </button>
        </div>
      </div>
    }
  `
})
export class PwaInstallBannerComponent {
  private platformId = inject(PLATFORM_ID);
  private router     = inject(Router);
  visible = signal(false);

  // Detectar si estamos en perfiles para ajustar posición
  isProfilesPage = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url.includes('/profiles'))
    ),
    { initialValue: typeof window !== 'undefined' && window.location.pathname.includes('profiles') }
  );

  // El navegador dispara este evento cuando la PWA es instalable
  private deferredPrompt: any = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Prevenimos el mini-infobar del browser y guardamos el evento para lanzarlo nosotros
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      // Mostrar el banner tras 4 segundos para no interrumpir la primera carga
      setTimeout(() => this.visible.set(true), 4000);
    });

    // Si el usuario ya instaló la app, ocultamos el banner
    window.addEventListener('appinstalled', () => {
      this.visible.set(false);
      this.deferredPrompt = null;
    });
  }

  install(): void {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then(() => {
      this.deferredPrompt = null;
      this.visible.set(false);
    });
  }

  dismiss(): void {
    this.visible.set(false);
    this.deferredPrompt = null;
  }
}
