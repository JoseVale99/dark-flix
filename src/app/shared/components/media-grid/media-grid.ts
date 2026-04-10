import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ApiMedia } from '@models';
import { MediaCardComponent } from '@shared/components/media-card/media-card';

@Component({
  selector: 'df-media-grid',
  template: `
    <div class="w-full">
      @if (title()) {
        <h2 class="text-2xl font-bold text-white mb-6">{{ title() }}</h2>
      }
      
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
        @for (item of mediaItems(); track item._id) {
          <df-media-card [media]="item" (selected)="mediaSelected.emit($event)" />
        } @empty {
          <p class="text-gray-500 col-span-full">Aún no hay contenido disponible.</p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MediaCardComponent]
})
export class MediaGridComponent {
  mediaItems = input.required<ApiMedia[]>();
  title = input<string>();
  mediaSelected = output<ApiMedia>();
}
