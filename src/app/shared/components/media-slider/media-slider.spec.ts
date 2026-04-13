import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaSliderComponent } from './media-slider';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ApiMedia } from '@models';
import { ComponentRef } from '@angular/core';

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
    
    // Configurar Inputs obligatorios
    componentRef.setInput('title', 'Carrusel Mock');
    componentRef.setInput('mediaItems', []);

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
