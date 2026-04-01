import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { WpPost } from '@models/wp-post.model';
import { MediaCardComponent } from '@shared/components/media-card/media-card';

@Component({
  selector: 'df-media-grid',
  template: `
    <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 px-4 py-8">
      @for (post of mediaItems(); track post.id) {
        <df-media-card [media]="post" (selected)="mediaSelected.emit($event)" />
      } @empty {
        <div class="col-span-full text-center text-df-muted py-10">
          No hay elementos disponibles en el catálogo.
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MediaCardComponent]
})
export class MediaGridComponent {
  mediaItems = input.required<WpPost[]>();
  mediaSelected = output<WpPost>();
}
