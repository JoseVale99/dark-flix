import { Pipe, PipeTransform } from '@angular/core';
import { ApiMedia } from '@models';

@Pipe({
  name: 'mediaUrl',
  standalone: true
})
export class MediaUrlPipe implements PipeTransform {
  transform(media: ApiMedia | undefined | null): string {
    if (!media) return '/';
    
    // Traducimos el postType interno a prefijos SEO en español
    let prefix = 'peliculas'; // valor por defecto
    if (media.type === 'tvshows') {
      prefix = 'series';
    } else if (media.type === 'animes') {
      prefix = 'animes';
    }

    return `/${prefix}/${media.slug}`;
  }
}
