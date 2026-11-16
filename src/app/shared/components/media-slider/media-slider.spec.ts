import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaSliderComponent } from './media-slider';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ApiMedia } from '@models';
import { ComponentRef, signal } from '@angular/core';

describe('MediaSliderComponent', () => {
  let component: MediaSliderComponent;
  let fixture: ComponentFixture<MediaSliderComponent>;
  let componentRef: ComponentRef<MediaSliderComponent>;

  beforeEach(async () => {
    // Mock para que jsdom no falle por no tener ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;

    await TestBed.configureTestingModule({
      imports: [MediaSliderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaSliderComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    // Workaround JIT/Vitest: los inputs signal requeridos no reciben valor con setInput.
    const titleSignal = signal('Carrusel Mock');
    const itemsSignal = signal<ApiMedia[]>([]);
    Object.defineProperty(component, 'title', { get: () => titleSignal });
    Object.defineProperty(component, 'mediaItems', { get: () => itemsSignal });

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debe crearse exitosamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener un array vacío de items o el configurado', () => {
    expect(component.mediaItems().length).toBe(0);
  });
});
