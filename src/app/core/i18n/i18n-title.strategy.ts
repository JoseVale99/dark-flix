import { effect, inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { I18nService } from './i18n.service';
import { TranslationKey } from './translations';

/**
 * Traduce los `title` declarados en `app.routes.ts` (que son claves de i18n)
 * y vuelve a aplicar el título cuando cambia el idioma.
 */
@Injectable({ providedIn: 'root' })
export class I18nTitleStrategy extends TitleStrategy {
  private readonly i18n = inject(I18nService);
  private readonly title = inject(Title);
  private lastSnapshot?: RouterStateSnapshot;

  constructor() {
    super();

    effect(() => {
      // Dependencia reactiva: al cambiar el idioma se recalcula el título.
      this.i18n.lang();
      const snapshot = this.lastSnapshot;
      if (snapshot) this.title.setTitle(this.buildTitle(snapshot) ?? 'DarkFlix');
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.lastSnapshot = snapshot;
    this.title.setTitle(this.buildTitle(snapshot) ?? 'DarkFlix');
  }

  override buildTitle(snapshot: RouterStateSnapshot): string | undefined {
    const key = super.buildTitle(snapshot);
    if (!key) return undefined;
    return `DarkFlix | ${this.i18n.t(key as TranslationKey)}`;
  }
}
