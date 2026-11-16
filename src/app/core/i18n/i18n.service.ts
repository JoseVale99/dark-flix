import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { en, es, Lang, TranslationKey } from './translations';

const STORAGE_KEY = 'df.lang';

/** Idioma inicial: preferencia guardada → español (idioma por defecto de la app). */
function detectInitialLang(): Lang {
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'es' || stored === 'en') return stored;
    } catch {
      /* localStorage bloqueado (modo privado / políticas): seguimos con el default */
    }
  }

  return 'es';
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/**
 * Servicio de internacionalización basado en signals.
 *
 * - `lang()` es la única fuente de verdad reactiva.
 * - `t()` lee `lang()`, por lo que cualquier binding que lo invoque se
 *   re-renderiza automáticamente al cambiar de idioma (sin pipes impuros).
 * - El diccionario se resuelve con acceso directo O(1) a objeto plano.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly dictionaries = { es, en } as const;

  private readonly _lang = signal<Lang>(detectInitialLang());

  /** Idioma activo (solo lectura). */
  readonly lang = this._lang.asReadonly();

  /** Códigos disponibles para el selector. */
  readonly languages: readonly Lang[] = ['es', 'en'];

  /** Locale BCP-47 para Intl (fechas, números...). */
  readonly locale = computed(() => (this._lang() === 'en' ? 'en-US' : 'es-ES'));

  readonly isEnglish = computed(() => this._lang() === 'en');

  constructor() {
    // Sincroniza <html lang> y persiste la preferencia.
    effect(() => {
      const lang = this._lang();
      this.document?.documentElement?.setAttribute('lang', lang);
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, lang);
        } catch {
          /* ignorado: no poder persistir no debe romper la app */
        }
      }
    });
  }

  setLang(lang: Lang): void {
    this._lang.set(lang);
  }

  toggleLang(): void {
    this._lang.update((current) => (current === 'es' ? 'en' : 'es'));
  }

  /** Traduce una clave con interpolación opcional de `{{param}}`. */
  t(key: TranslationKey, params?: Record<string, string | number>): string {
    const dictionary = this.dictionaries[this._lang()];
    const raw = dictionary[key] ?? es[key] ?? key;
    return params ? interpolate(raw, params) : raw;
  }

  /**
   * Nombre localizado de un término de taxonomía (género/país) usando su slug.
   * Si no existe traducción, devuelve el nombre que entrega la API.
   */
  term(kind: 'genre' | 'country', slug: string, fallback: string): string {
    const dictionary = this.dictionaries[this._lang()] as Record<string, string>;
    return dictionary[`${kind}.${slug}`] ?? fallback;
  }

  /** Etiqueta corta del tipo de contenido (`tvshows` | `movies` | `animes`). */
  mediaTypeLabel(type: string | undefined): string {
    if (type === 'tvshows') return this.t('type.series');
    if (type === 'movies') return this.t('type.movie');
    return this.t('type.anime');
  }
}
