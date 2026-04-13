import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiMedia } from '@models';
import { ProfileService } from '@services/profile';

@Injectable({
  providedIn: 'root'
})
export class MyListService {
  private readonly baseKey = 'df_my_list';
  private platformId   = inject(PLATFORM_ID);
  private profileService = inject(ProfileService);

  public list = signal<ApiMedia[]>([]);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Cargar datos del perfil activo
    this._loadForActiveProfile();

    // Re-cargar cada vez que cambie el perfil activo
    effect(() => {
      const profile = this.profileService.activeProfile();
      if (profile) this._loadForActiveProfile();
      else this.list.set([]);
    });

    // Auto-save al perfil activo
    effect(() => {
      const profile = this.profileService.activeProfile();
      if (!profile) return;
      localStorage.setItem(`${this.baseKey}_${profile.id}`, JSON.stringify(this.list()));
    });
  }

  private _loadForActiveProfile(): void {
    const profile = this.profileService.activeProfile();
    if (!profile) { this.list.set([]); return; }
    const key    = `${this.baseKey}_${profile.id}`;
    const stored = localStorage.getItem(key);
    // Migración: si existe el key genérico antiguo y el nuevo está vacío, migrar
    if (!stored) {
      const legacy = localStorage.getItem(this.baseKey);
      if (legacy && profile.id === 'principal') {
        localStorage.setItem(key, legacy);
        try { this.list.set(JSON.parse(legacy)); } catch { this.list.set([]); }
        return;
      }
    }
    try { this.list.set(stored ? JSON.parse(stored) : []); }
    catch { this.list.set([]); }
  }

  isInList(mediaId: string | number): boolean {
    return this.list().some(m => m._id === mediaId);
  }

  toggleList(media: ApiMedia): void {
    const isPresent = this.isInList(media._id);
    if (isPresent) {
      this.list.update(items => items.filter(m => m._id !== media._id));
    } else {
      this.list.update(items => [media, ...items]);
    }
  }
}
