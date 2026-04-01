import { WpImagePipe } from './wp-image';
import { ApiMedia } from '@models';

describe('WpImagePipe', () => {
  let pipe: WpImagePipe;

  beforeEach(() => {
    pipe = new WpImagePipe();
  });

  it('debe devolver vacío si el post es nulo', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('debe devolver url del poster con prefijo', () => {
    const mockPost = {
      images: {
        poster: '/thumbs/poster.webp',
        backdrop: '/backdrops/bg.webp'
      }
    } as ApiMedia;

    expect(pipe.transform(mockPost, 'poster')).toBe('https://hackstore.mx/thumbs/poster.webp');
  });

  it('debe devolver url del backdrop nativo full', () => {
    const mockPost = {
      images: {
        poster: '/thumbs/poster.webp',
        backdrop: '/backdrops/bg.webp'
      }
    } as ApiMedia;

    expect(pipe.transform(mockPost, 'backdrop')).toBe('https://hackstore.mx/backdrops/bg.webp');
  });
});
