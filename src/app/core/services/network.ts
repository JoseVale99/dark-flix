import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private platformId = inject(PLATFORM_ID);
  
  // Asumimos online por defecto si estamos en el servidor
  public isOnline = signal<boolean>(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Estado inicial
      this.isOnline.set(navigator.onLine);

      // Escuchar eventos globales del navegador
      window.addEventListener('online', () => this.isOnline.set(true));
      window.addEventListener('offline', () => this.isOnline.set(false));
    }
  }
}
