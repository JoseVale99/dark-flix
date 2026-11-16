import { Pipe, PipeTransform, inject } from '@angular/core';
import { ApiMedia } from '@models';
import { MediaNavigationService } from '@services/media-navigation';

@Pipe({
  name: 'mediaUrl',
  standalone: true
})
export class MediaUrlPipe implements PipeTransform {
  private mediaNavigation = inject(MediaNavigationService);

  transform(media: ApiMedia | undefined | null): string {
    return this.mediaNavigation.buildUrl(media);
  }
}
