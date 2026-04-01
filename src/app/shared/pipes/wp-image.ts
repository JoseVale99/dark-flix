import { Pipe, PipeTransform } from '@angular/core';
import { ApiMedia } from '@models';

@Pipe({
  name: 'wpImage',
  standalone: true
})
export class WpImagePipe implements PipeTransform {
  transform(post: ApiMedia | null | undefined, size: 'poster' | 'backdrop' | 'logo' = 'poster'): string {
    if (!post || !post.images) {
      return '';
    }

    const host = 'https://hackstore.mx/wp-content/uploads';
    
    // Devolver la imagen solicitada asumiendo fallback cruzado si algo falta
    switch(size) {
       case 'backdrop': return host + (post.images.backdrop || post.images.poster || '');
       case 'logo': return host + (post.images.logo || '');
       case 'poster':
       default: 
           return host + (post.images.poster || post.images.backdrop || '');
    }
  }
}
