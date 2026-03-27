import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProgressBarService } from '@services/progress-bar';

@Component({
  selector: 'df-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="fixed top-0 left-0 right-0 z-9999 h-[3px] bg-transparent pointer-events-none"
        role="progressbar"
        [attr.aria-valuenow]="progress()"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Cargando"
      >
        <!-- Barra principal -->
        <div
          class="h-full bg-df-accent transition-all duration-300 ease-out shadow-[0_0_8px_#e50914]"
          [style.width.%]="progress()"
        ></div>
        <!-- Brillo en el extremo derecho -->
        <div
          class="absolute top-0 right-0 h-full w-24 bg-linear-to-l from-white/40 to-transparent transition-opacity duration-150"
          [style.opacity]="progress() > 5 ? 1 : 0"
        ></div>
      </div>
    }
  `,
})
export class ProgressBarComponent {
  private readonly svc = inject(ProgressBarService);

  readonly visible  = this.svc.visible;
  readonly progress = this.svc.progress;
}
