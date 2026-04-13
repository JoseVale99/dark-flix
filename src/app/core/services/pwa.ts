import { Injectable, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private readonly platformId = inject(PLATFORM_ID);

  // Estados de la PWA
  private readonly deferredPrompt = signal<any>(null);
  readonly isStandalone = signal(false);
  readonly canInstall = computed(() => this.deferredPrompt() !== null);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    // 1. Detectar si ya estamos en modo standalone (instalada)
    this.checkStandalone();

    // 2. Escuchar el evento de instalación de Chrome/Edge
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt.set(e);
      console.log('[PwaService] Aplicación lista para ser instalada');
    });

    // 3. Limpiar cuando se instala
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt.set(null);
      this.isStandalone.set(true);
      console.log('[PwaService] Aplicación instalada con éxito');
    });
  }

  private checkStandalone(): void {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                        || (window.navigator as any).standalone === true;
      this.isStandalone.set(isStandalone);
    }
  }

  async promptInstall(): Promise<void> {
    const prompt = this.deferredPrompt();
    if (!prompt) return;

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    
    if (outcome === 'accepted') {
      this.deferredPrompt.set(null);
    }
  }
}
