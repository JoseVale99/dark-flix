import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PROFILE_ICON_KEYS, ProfileIconKey } from '@core/models/profile-icons';

export interface DfProfile {
  id: string;
  name: string;
  avatar: ProfileIconKey;
  color: string;  // color de acento hex
}

const DEFAULT_PROFILES: DfProfile[] = [
  { id: 'principal', name: 'Principal', avatar: 'cinema', color: '#e50914' },
];

const COLORS  = ['#e50914', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6'];

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly storageKey  = 'df_profiles';
  private readonly sessionKey  = 'df_active_profile_id'; // Se mantiene el nombre pero usaremos localStorage
  private readonly platformId  = inject(PLATFORM_ID);

  // ── State ──────────────────────────────────────────────────────────────────
  profiles     = signal<DfProfile[]>(DEFAULT_PROFILES);
  activeProfile = signal<DfProfile | null>(null);

  isProfileSelected = computed(() => this.activeProfile() !== null);

  // ── Static helpers ─────────────────────────────────────────────────────────
  static readonly AVATAR_KEYS = PROFILE_ICON_KEYS;
  static readonly COLORS      = COLORS;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Cargar perfiles guardados
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try { this.profiles.set(JSON.parse(stored)); }
      catch { this.profiles.set(DEFAULT_PROFILES); }
    } else {
      // Primera vez — guarda los perfiles por defecto
      localStorage.setItem(this.storageKey, JSON.stringify(DEFAULT_PROFILES));
    }

    // Restaurar perfil activo (Persistente entre pestañas/sesiones)
    const activeId = localStorage.getItem(this.sessionKey);
    if (activeId) {
      const found = this.profiles().find(p => p.id === activeId) ?? null;
      this.activeProfile.set(found);
    }
  }

  // ── Selección ──────────────────────────────────────────────────────────────
  selectProfile(profile: DfProfile): void {
    this.activeProfile.set(profile);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.sessionKey, profile.id);
    }
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  addProfile(name: string, avatar: ProfileIconKey, color: string): DfProfile {
    const newProfile: DfProfile = {
      id: `profile_${Date.now()}`,
      name: name.trim() || 'Perfil',
      avatar,
      color,
    };
    this.profiles.update(ps => [...ps, newProfile]);
    this._persist();
    return newProfile;
  }

  updateProfile(id: string, changes: Partial<Pick<DfProfile, 'name' | 'avatar' | 'color'>>): void {
    this.profiles.update(ps => ps.map(p => p.id === id ? { ...p, ...changes } : p));
    // Si se está editando el perfil activo, actualizarlo también
    if (this.activeProfile()?.id === id) {
      this.activeProfile.update(p => p ? { ...p, ...changes } : p);
    }
    this._persist();
  }

  deleteProfile(id: string): void {
    // No se puede borrar si solo queda uno
    if (this.profiles().length <= 1) return;
    this.profiles.update(ps => ps.filter(p => p.id !== id));
    // Limpiar datos asociados al perfil eliminado
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(`df_my_list_${id}`);
      localStorage.removeItem(`df_watch_history_${id}`);
    }
    this._persist();
  }

  logout(): void {
    this.activeProfile.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.sessionKey);
    }
  }

  private _persist(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.profiles()));
    }
  }
}
