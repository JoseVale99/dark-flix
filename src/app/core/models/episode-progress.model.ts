export interface EpisodeProgress {
  /** ID de la serie/anime padre */
  showId: string | number;
  /** ID único del episodio */
  episodeId: string | number;
  /** Temporada del episodio */
  seasonNumber: number;
  /** Número de episodio */
  episodeNumber: number;
  /** Título del episodio */
  title: string;
  /** Timestamp en segundos donde se quedó */
  progressSeconds: number;
  /** Duración total del episodio en segundos (si disponible) */
  durationSeconds: number;
  /** Si el episodio fue marcado como visto (>90% progreso o manual) */
  watched: boolean;
  /** Última fecha de actualización (ISO string) */
  lastUpdated: string;
}
