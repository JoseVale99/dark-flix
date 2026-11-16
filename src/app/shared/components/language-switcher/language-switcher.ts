import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '@core/i18n/i18n.service';

/**
 * Selector compacto ES / EN. Cambia el idioma de toda la app al instante.
 */
@Component({
  selector: 'df-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="inline-flex items-center gap-0.5 rounded-full border border-white/15 bg-white/5 p-0.5"
      role="group"
      [attr.aria-label]="i18n.t('lang.aria')"
    >
      @for (lang of i18n.languages; track lang) {
        <button
          type="button"
          (click)="i18n.setLang(lang)"
          [attr.aria-pressed]="i18n.lang() === lang"
          [class]="
            i18n.lang() === lang
              ? 'bg-df-accent text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          "
          class="px-2 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
        >
          {{ lang }}
        </button>
      }
    </div>
  `,
})
export class LanguageSwitcherComponent {
  public readonly i18n = inject(I18nService);
}
