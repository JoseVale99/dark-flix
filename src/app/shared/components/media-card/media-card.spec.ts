import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaCardComponent } from './media-card';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import { signal, WritableSignal, NO_ERRORS_SCHEMA } from '@angular/core';
import { WpPost } from '../../../core/models/wp-post.model';

describe('MediaCardComponent', () => {
  let component: MediaCardComponent;
  let fixture: ComponentFixture<MediaCardComponent>;
  let mediaSignal: WritableSignal<WpPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaCardComponent]
    })
    // Forzamos ignorar los errores del JIT Compiler sobre los inputs de los componentes internos (LazyImageDirective, etc.)
    .overrideComponent(MediaCardComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
    .compileComponents();

    fixture = TestBed.createComponent(MediaCardComponent);
    component = fixture.componentInstance;

    // Manejo de mock signal para bypassear fallos en el ambiente JS DOM con JIT
    mediaSignal = signal({
      id: 1,
      slug: 'test',
      title: { rendered: 'Test Post' },
      excerpt: { rendered: '' },
      content: { rendered: '' },
      featured_media: 0,
      meta: {}
    } as WpPost);

    Object.defineProperty(component, 'media', { get: () => mediaSignal });
    
    // Setear mock espía para el output
    component.selected.emit = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Property Tests (PBT)
  it('Propiedad 1: output selected emite el mismo WpPost recibido al hacer click', () => {
    fc.assert(
      fc.property(fc.record({
        id: fc.integer({ min: 1 }),
        slug: fc.string(),
        title: fc.record({ rendered: fc.string() }),
        excerpt: fc.record({ rendered: fc.string() }),
        content: fc.record({ rendered: fc.string() }),
        featured_media: fc.integer({ min: 0 }),
        meta: fc.dictionary(fc.string(), fc.anything())
      }), (arbitraryPost) => {
        // Enlazar datos aleatorios generados
        const postMock = arbitraryPost as unknown as WpPost;
        mediaSignal.set(postMock);
        fixture.detectChanges();

        // Extraer elemento trigger
        const cardDiv = fixture.nativeElement.querySelector('.group');
        cardDiv.click();
        
        // Comprobar que el espía emitió este objeto exactamente (identidad referencial por input)
        expect(component.selected.emit).toHaveBeenCalledWith(postMock);
      }),
      { numRuns: 100 }
    );
  });

  it('Propiedad 2: título mostrado coincide con el input', () => {
    fc.assert(
      fc.property(fc.string(), (randomTitle) => {
        mediaSignal.set({
          id: 1, slug: '', title: { rendered: randomTitle }, excerpt: { rendered: '' }, content: { rendered: '' }, featured_media: 0, meta: {}
        } as WpPost);
        
        fixture.detectChanges();
        
        const titleEl = fixture.nativeElement.querySelector('p');
        expect(titleEl.textContent).toBe(randomTitle);
      }),
      { numRuns: 100 }
    );
  });

  // Unit Tests
  it('skeleton visible cuando imageLoaded es false', () => {
    component.imageLoaded.set(false);
    fixture.detectChanges();
    
    const skeleton = fixture.nativeElement.querySelector('df-skeleton-card');
    expect(skeleton).toBeTruthy();
  });

  it('skeleton oculto cuando imageLoaded es true', () => {
    component.imageLoaded.set(true);
    fixture.detectChanges();
    
    const skeleton = fixture.nativeElement.querySelector('df-skeleton-card');
    expect(skeleton).toBeNull();
  });

  it('el elemento img tiene el atributo dfLazyImage', () => {
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    
    expect(img).toBeTruthy();
    expect(img.hasAttribute('dfLazyImage')).toBe(true);
  });
});
