import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaCardComponent } from './media-card';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { ApiMedia } from '@models';
import { ComponentRef } from '@angular/core';

describe('MediaCardComponent', () => {
  let component: MediaCardComponent;
  let fixture: ComponentFixture<MediaCardComponent>;
  let componentRef: ComponentRef<MediaCardComponent>;

  // Variables simuladas para las props (Signals)
  let mediaSignal: any;
  let selectedSpy: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaCardComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    // Configurar Inputs iniciales (Simulando lo que pasaría desde el padre)
    mediaSignal = componentRef.setInput('media', { 
      _id: 1, 
      title: 'Prueba', 
      slug: 'prueba', 
      overview: '',
      images: { poster: '', backdrop: '', logo: '' } 
    } as unknown as ApiMedia);

    // Mockear el output para escucharlo
    selectedSpy = vi.spyOn(component.selected, 'emit');
    
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Property Tests (PBT)
  it('Propiedad 1: output selected emite el mismo ApiMedia recibido al hacer click', () => {
    fc.assert(
      fc.property(fc.record({
        _id: fc.integer({ min: 1 }),
        title: fc.string(),
        slug: fc.string(),
        overview: fc.string()
      }), (randomMedia) => {
        // Ejecutar escenario
        componentRef.setInput('media', randomMedia as unknown as ApiMedia);
        fixture.detectChanges();

        const cardElement = fixture.nativeElement.querySelector('.group');
        cardElement.click();

        // Verificamos propiedad
        expect(selectedSpy).toHaveBeenCalledWith(randomMedia);
        
        // Limpiar para siguiente prueba
        selectedSpy.mockClear();
      })
    );
  });

  it('Propiedad 2: título mostrado coincide con el input', () => {
    fc.assert(
      fc.property(fc.string(), (randomTitle) => {
        componentRef.setInput('media', {
          _id: 1, 
          title: randomTitle, 
          slug: 'random', 
          overview: '',
          images: { poster: '', backdrop: '', logo: '' } 
        } as unknown as ApiMedia);
        fixture.detectChanges();

        const titleElement = fixture.nativeElement.querySelector('.truncate');
        expect(titleElement.textContent).toBe(randomTitle);
      })
    );
  });

  // Example-based test (Los clásicos)
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
    const img = fixture.nativeElement.querySelector('img');
    expect(img.hasAttribute('dfLazyImage')).toBe(true);
  });
});
