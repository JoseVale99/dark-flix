import { Pipe, PipeTransform } from '@angular/core';
import type { WpPost } from '@models';

@Pipe({ name: 'wpImage', pure: true })
export class WpImagePipe implements PipeTransform {
  transform(
    post: WpPost | null | undefined,
    size: 'full' | 'medium' | 'thumbnail' = 'medium'
  ): string | null {
    if (!post) return null;

    const media = post._embedded?.['wp:featuredmedia']?.[0];
    if (!media) return null;

    // Intentar obtener el tamaño solicitado
    const sizeUrl = media.media_details?.sizes?.[size]?.source_url;
    if (sizeUrl) return sizeUrl;

    // Fallback a source_url si el tamaño no existe
    return media.source_url ?? null;
  }
}
