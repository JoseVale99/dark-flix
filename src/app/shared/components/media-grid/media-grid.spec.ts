import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaGridComponent } from './media-grid';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { signal, WritableSignal, NO_ERRORS_SCHEMA } from '@angular/core';
import { WpPost } from '../../../core/models/wp-post.model';
import { MediaCardComponent } from '../media-card/media-card';

describe('MediaGridComponent', () => {
  let component: MediaGridComponent;
  let fixture: ComponentFixture<MediaGridComponent>;
  let arraySignal: WritableSignal<WpPost[]>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaGridComponent]
    })
    // Removemos la dependencia hija para no compilar su template/signals
    .overrideComponent(MediaGridComponent, { 
      remove: { imports: [MediaCardComponent] },
      add: { schemas: [NO_ERRORS_SCHEMA] } 
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaGridComponent);
    component = fixture.componentInstance;

    // Aislamos los items para evitar fallos de inicialización con Vitest Signal Input compiler bug 
    arraySignal = signal([]);
    Object.defineProperty(component, 'mediaItems', { get: () => arraySignal });
    component.mediaSelected.emit = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza estructura grid responsiva y mensaje de estado vacío (empty)', () => {
    arraySignal.set([]); // Array vacío
    fixture.detectChanges();
    
    const container = fixture.nativeElement.querySelector('.grid');
    expect(container.className).toContain('grid-cols-2');
    expect(container.className).toContain('md:grid-cols-4');
    expect(container.textContent).toContain('No hay elementos disponibles');
  });

  it('renderiza tantas df-media-card como items en input array empleando un bucle optimizado por IDs', () => {
    const mockPosts = [
       { id: 101, title: { rendered: 'Pelicula 1' } } as WpPost,
       { id: 102, title: { rendered: 'Pelicula 2' } } as WpPost,
       { id: 103, title: { rendered: 'Pelicula 3' } } as WpPost
    ];
    arraySignal.set(mockPosts);
    fixture.detectChanges();
    
    const cards = fixture.nativeElement.querySelectorAll('df-media-card');
    expect(cards.length).toBe(3);
  });
});
