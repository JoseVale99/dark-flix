import * as fc from 'fast-check';
import { WpImagePipe } from './wp-image';
import type { WpPost, WpMedia } from '@models';

const pipe = new WpImagePipe();

// --- Generadores ---

const wpImageSizeArb = fc.record({ source_url: fc.webUrl() });

const wpMediaArb: fc.Arbitrary<WpMedia> = fc.record({
  id: fc.integer({ min: 1 }),
  source_url: fc.webUrl(),
  media_details: fc.option(
    fc.record({
      sizes: fc.option(
        fc.record({
          full:      fc.option(wpImageSizeArb, { nil: undefined }),
          medium:    fc.option(wpImageSizeArb, { nil: undefined }),
          thumbnail: fc.option(wpImageSizeArb, { nil: undefined }),
        })
      , { nil: undefined }),
    })
  , { nil: undefined }),
});

const wpPostArb: fc.Arbitrary<WpPost> = fc.record({
  id: fc.integer({ min: 1 }),
  slug: fc.string(),
  title: fc.record({ rendered: fc.string() }),
  excerpt: fc.record({ rendered: fc.string() }),
  content: fc.record({ rendered: fc.string() }),
  featured_media: fc.integer({ min: 0 }),
  meta: fc.constant({}),
  _embedded: fc.option(
    fc.record({
      'wp:featuredmedia': fc.array(wpMediaArb, { minLength: 0, maxLength: 3 }),
      'wp:term': fc.constant([]),
    })
  , { nil: undefined }),
});

// --- Property tests ---

describe('WpImagePipe — property-based tests', () => {

  // Feature: shared-ui, Property 9: WpImagePipe nunca lanza excepción para ningún input
  it('Property 9 — nunca lanza excepción para ningún input (robustez total)', () => {
    fc.assert(
      fc.property(fc.anything(), fc.anything(), (post, size) => {
        expect(() =>
          pipe.transform(post as WpPost, size as 'full' | 'medium' | 'thumbnail')
        ).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  // Feature: shared-ui, Property 9 (parte 2): siempre retorna string | null
  it('Property 9b — siempre retorna string | null', () => {
    fc.assert(
      fc.property(fc.anything(), (post) => {
        const result = pipe.transform(post as WpPost);
        expect(result === null || typeof result === 'string').toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: shared-ui, Property 6: extrae la URL correcta del tamaño solicitado
  it('Property 6 — extrae la URL del tamaño solicitado cuando existe', () => {
    fc.assert(
      fc.property(
        wpPostArb,
        fc.constantFrom('full', 'medium', 'thumbnail' as const),
        (post, size) => {
          const expectedUrl =
            post._embedded?.['wp:featuredmedia']?.[0]
              ?.media_details?.sizes?.[size]?.source_url;

          if (expectedUrl) {
            expect(pipe.transform(post, size)).toBe(expectedUrl);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: shared-ui, Property 7: usa source_url como fallback
  it('Property 7 — usa source_url como fallback cuando el tamaño no existe', () => {
    fc.assert(
      fc.property(wpMediaArb, (media) => {
        // Construir un post donde el tamaño 'medium' no existe pero source_url sí
        const post: WpPost = {
          id: 1, slug: 'test',
          title: { rendered: 'Test' },
          excerpt: { rendered: '' },
          content: { rendered: '' },
          featured_media: 1,
          meta: {},
          _embedded: {
            'wp:featuredmedia': [{ ...media, media_details: undefined }],
            'wp:term': [],
          },
        };
        const result = pipe.transform(post, 'medium');
        expect(result).toBe(media.source_url);
      }),
      { numRuns: 50 }
    );
  });

  // Feature: shared-ui, Property 8: retorna null sin _embedded
  it('Property 8 — retorna null cuando no hay imagen disponible', () => {
    fc.assert(
      fc.property(wpPostArb, (post) => {
        const postSinEmbedded: WpPost = { ...post, _embedded: undefined };
        expect(pipe.transform(postSinEmbedded)).toBeNull();
      }),
      { numRuns: 50 }
    );
  });

  // Feature: shared-ui, Property 10: idempotente (pureza)
  it('Property 10 — es idempotente: dos llamadas con el mismo input producen el mismo resultado', () => {
    fc.assert(
      fc.property(
        wpPostArb,
        fc.constantFrom('full', 'medium', 'thumbnail' as const),
        (post, size) => {
          const r1 = pipe.transform(post, size);
          const r2 = pipe.transform(post, size);
          expect(r1).toBe(r2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Tests unitarios ---

describe('WpImagePipe — tests unitarios', () => {
  it('retorna URL de medium por defecto cuando existe', () => {
    const post: WpPost = {
      id: 1, slug: 'test',
      title: { rendered: 'Test' },
      excerpt: { rendered: '' },
      content: { rendered: '' },
      featured_media: 1,
      meta: {},
      _embedded: {
        'wp:featuredmedia': [{
          id: 1,
          source_url: 'https://example.com/full.jpg',
          media_details: {
            sizes: {
              medium: { source_url: 'https://example.com/medium.jpg' },
            },
          },
        }],
        'wp:term': [],
      },
    };
    expect(pipe.transform(post)).toBe('https://example.com/medium.jpg');
  });

  it('retorna source_url cuando medium no existe en sizes', () => {
    const post: WpPost = {
      id: 1, slug: 'test',
      title: { rendered: 'Test' },
      excerpt: { rendered: '' },
      content: { rendered: '' },
      featured_media: 1,
      meta: {},
      _embedded: {
        'wp:featuredmedia': [{
          id: 1,
          source_url: 'https://example.com/original.jpg',
          media_details: { sizes: {} },
        }],
        'wp:term': [],
      },
    };
    expect(pipe.transform(post)).toBe('https://example.com/original.jpg');
  });

  it('retorna null con post null', () => {
    expect(pipe.transform(null)).toBeNull();
  });

  it('retorna null con post undefined', () => {
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('retorna null con post sin _embedded', () => {
    const post: WpPost = {
      id: 1, slug: 'test',
      title: { rendered: 'Test' },
      excerpt: { rendered: '' },
      content: { rendered: '' },
      featured_media: 0,
      meta: {},
    };
    expect(pipe.transform(post)).toBeNull();
  });

  it('retorna null con _embedded featuredmedia vacío', () => {
    const post: WpPost = {
      id: 1, slug: 'test',
      title: { rendered: 'Test' },
      excerpt: { rendered: '' },
      content: { rendered: '' },
      featured_media: 0,
      meta: {},
      _embedded: { 'wp:featuredmedia': [], 'wp:term': [] },
    };
    expect(pipe.transform(post)).toBeNull();
  });
});
