import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiMedia } from '@models';
import { ProfileService } from '@services/profile';

@Injectable({
  providedIn: 'root'
})
export class WatchHistoryService {
  private readonly baseKey = 'df_watch_history';
  private readonly maxItems = 25;
  private platformId     = inject(PLATFORM_ID);
  private profileService = inject(ProfileService);

  public history = signal<ApiMedia[]>([]);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    this._loadForActiveProfile();

    // Re-cargar cuando cambie el perfil
    effect(() => {
      const profile = this.profileService.activeProfile();
      if (profile) this._loadForActiveProfile();
      else this.history.set([]);
    });

    // Auto-save al perfil activo
    effect(() => {
      const profile = this.profileService.activeProfile();
      if (!profile) return;
      localStorage.setItem(`${this.baseKey}_${profile.id}`, JSON.stringify(this.history()));
    });
  }

  private _loadForActiveProfile(): void {
    const profile = this.profileService.activeProfile();
    if (!profile) { this.history.set([]); return; }
    const key    = `${this.baseKey}_${profile.id}`;
    const stored = localStorage.getItem(key);
    // Migración del key genérico antiguo al perfil principal
    if (!stored && profile.id === 'principal') {
      const legacy = localStorage.getItem(this.baseKey);
      if (legacy) {
        localStorage.setItem(key, legacy);
        try { this.history.set(JSON.parse(legacy)); } catch { this.history.set([]); }
        return;
      }
    }
    try { this.history.set(stored ? JSON.parse(stored) : []); }
    catch { this.history.set([]); }
  }

  addToHistory(media: ApiMedia): void {
    if (!media || !media._id) return;
    this.history.update(current => {
      const filtered = current.filter(m => m._id !== media._id);
      return [media, ...filtered].slice(0, this.maxItems);
    });
  }

  clearHistory(): void {
    this.history.set([]);
  }
}
