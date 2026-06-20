import { Injectable, signal, effect, computed, untracked, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EpisodeProgress } from '@models';
import { ProfileService } from '@services/profile';

@Injectable({
  providedIn: 'root'
})
export class EpisodeProgressService {
  private readonly BASE_KEY = 'df_episode_progress';
  private readonly WATCHED_THRESHOLD = 0.9; // 90% para marcar como visto

  private readonly platformId = inject(PLATFORM_ID);
  private readonly profileService = inject(ProfileService);

  /** Mapa reactivo: clave = `${showId}_${episodeId}`, valor = EpisodeProgress */
  readonly progressMap = signal<Map<string, EpisodeProgress>>(new Map());

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Carga inicial
    this._loadForActiveProfile();

    // Re-cargar cuando cambie el perfil activo
    effect(() => {
      const profile = this.profileService.activeProfile();
      // Leer profile activa el tracking; la carga se hace sin seguimiento de progressMap
      untracked(() => this._loadForActiveProfile());
    });

    // Auto-persistencia: guardar cuando cambie el mapa
    // Usamos untracked para leer el perfil sin crear dependencia circular
    effect(() => {
      // Suscribirse al mapa para disparar el efecto cuando cambie
      const map = this.progressMap();
      const profile = untracked(() => this.profileService.activeProfile());
      const key = profile
        ? `${this.BASE_KEY}_${profile.id}`
        : this.BASE_KEY; // fallback sin perfil
      const obj = Object.fromEntries(map);
      localStorage.setItem(key, JSON.stringify(obj));
    });
  }

  /** Clave de storage para el perfil activo (o genérica si no hay perfil). */
  private _storageKey(): string {
    const profile = this.profileService.activeProfile();
    return profile ? `${this.BASE_KEY}_${profile.id}` : this.BASE_KEY;
  }

  private _loadForActiveProfile(): void {
    const key = this._storageKey();
    const stored = localStorage.getItem(key);

    // Migración: si existe data en la clave genérica y estamos con perfil 'principal', migrar
    if (!stored) {
      const profile = this.profileService.activeProfile();
      if (profile && profile.id !== this.BASE_KEY) {
        const legacy = localStorage.getItem(this.BASE_KEY);
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy) as Record<string, EpisodeProgress>;
            this.progressMap.set(new Map(Object.entries(parsed)));
          } catch {
            this.progressMap.set(new Map());
          }
          return;
        }
      }
      this.progressMap.set(new Map());
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Record<string, EpisodeProgress>;
      this.progressMap.set(new Map(Object.entries(parsed)));
    } catch {
      this.progressMap.set(new Map());
    }
  }

  private _mapKey(showId: string | number, episodeId: string | number): string {
    return `${showId}_${episodeId}`;
  }

  /**
   * Guarda o actualiza el progreso de un episodio.
   * Si progressSeconds >= durationSeconds * WATCHED_THRESHOLD, lo marca como visto.
   */
  saveProgress(
    showId: string | number,
    episodeId: string | number,
    seasonNumber: number,
    episodeNumber: number,
    title: string,
    progressSeconds: number,
    durationSeconds: number
  ): void {
    const key = this._mapKey(showId, episodeId);
    const existing = this.progressMap().get(key);
    const watched =
      (existing?.watched) ||
      (durationSeconds > 0 && progressSeconds / durationSeconds >= this.WATCHED_THRESHOLD);

    const progress: EpisodeProgress = {
      showId,
      episodeId,
      seasonNumber,
      episodeNumber,
      title,
      progressSeconds,
      durationSeconds,
      watched,
      lastUpdated: new Date().toISOString()
    };

    this.progressMap.update(map => {
      const next = new Map(map);
      next.set(key, progress);
      return next;
    });
  }

  /** Marca manualmente un episodio como visto (sin importar el progreso). */
  markAsWatched(
    showId: string | number,
    episodeId: string | number,
    seasonNumber: number,
    episodeNumber: number,
    title: string
  ): void {
    const key = this._mapKey(showId, episodeId);
    const existing = this.progressMap().get(key);

    const progress: EpisodeProgress = {
      showId,
      episodeId,
      seasonNumber,
      episodeNumber,
      title,
      progressSeconds: existing?.progressSeconds ?? 0,
      durationSeconds: existing?.durationSeconds ?? 0,
      watched: true,
      lastUpdated: new Date().toISOString()
    };

    this.progressMap.update(map => {
      const next = new Map(map);
      next.set(key, progress);
      return next;
    });
  }

  /** Desmarca un episodio como visto y elimina su progreso. */
  unmarkAsWatched(showId: string | number, episodeId: string | number): void {
    const key = this._mapKey(showId, episodeId);
    this.progressMap.update(map => {
      const next = new Map(map);
      next.delete(key);
      return next;
    });
  }

  /** Devuelve el progreso de un episodio concreto, o undefined si no existe. */
  getProgress(showId: string | number, episodeId: string | number): EpisodeProgress | undefined {
    return this.progressMap().get(this._mapKey(showId, episodeId));
  }

  /** Retorna true si el episodio fue marcado como visto. */
  isWatched(showId: string | number, episodeId: string | number): boolean {
    return this.progressMap().get(this._mapKey(showId, episodeId))?.watched ?? false;
  }

  /** Porcentaje de progreso (0-100) de un episodio. Retorna 0 si no hay datos. */
  getProgressPercent(showId: string | number, episodeId: string | number): number {
    const ep = this.getProgress(showId, episodeId);
    if (!ep || ep.durationSeconds <= 0) return ep?.watched ? 100 : 0;
    return Math.min(100, Math.round((ep.progressSeconds / ep.durationSeconds) * 100));
  }

  /** Devuelve todos los episodios con progreso de una serie específica. */
  getShowProgress(showId: string | number): EpisodeProgress[] {
    return Array.from(this.progressMap().values())
      .filter(ep => String(ep.showId) === String(showId));
  }

  /**
   * Devuelve el último episodio visto (o en progreso) de una serie,
   * ordenado por `lastUpdated` descendente. Útil para "Continuar viendo".
   */
  getLastWatchedEpisode(showId: string | number): EpisodeProgress | undefined {
    const episodes = this.getShowProgress(showId);
    if (episodes.length === 0) return undefined;
    return episodes.sort(
      (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )[0];
  }

  /** Elimina todo el progreso guardado de una serie. */
  clearShowProgress(showId: string | number): void {
    this.progressMap.update(map => {
      const next = new Map(map);
      for (const key of next.keys()) {
        if (key.startsWith(`${showId}_`)) next.delete(key);
      }
      return next;
    });
  }

  /** Computed: número total de episodios vistos en todas las series. */
  readonly totalWatched = computed(() =>
    Array.from(this.progressMap().values()).filter(ep => ep.watched).length
  );
}
