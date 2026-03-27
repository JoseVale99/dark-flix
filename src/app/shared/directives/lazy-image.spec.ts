import { TestBed } from '@angular/core/testing';
import { ElementRef, signal } from '@angular/core';
import { LazyImageDirective } from './lazy-image';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('LazyImageDirective (Aislado)', () => {
  let directive: LazyImageDirective;
  let img: HTMLImageElement;
  let mockObserve: any;
  let mockDisconnect: any;
  let originalIntersectionObserver: any;

  beforeEach(async () => {
    originalIntersectionObserver = global.IntersectionObserver;
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();

    class MockObserver {
      constructor(callback: any) {
        (global as any).__intersectionObserverCallback = callback;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
    }
    
    global.IntersectionObserver = MockObserver as any;

    img = document.createElement('img');
    const elRef = new ElementRef(img);

    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useValue: elRef }
      ]
    });

    // Instanciar directiva en el contexto seguro de inyección
    TestBed.runInInjectionContext(() => {
      directive = new LazyImageDirective();
      
      // Sobrescribimos el Input Signal readonly para inyectarle un valor en testing aislado
      Object.defineProperty(directive, 'lazySrc', {
        get: () => signal('test.jpg')
      });
    });
  });

  afterEach(() => {
    global.IntersectionObserver = originalIntersectionObserver;
    delete (global as any).__intersectionObserverCallback;
    vi.clearAllMocks();
  });

  // Helper para simular que afterNextRender se disparó 
  // (ya que en testing aislado puro TestBed no flushea effects automáticamente)
  const triggerAfterNextRender = async () => {
    // Al instanciar `new LazyImageDirective()`, Angular encoló un effect de afterNextRender.
    // Forzamos la detección de cambios global del TestBed para que ejecute afterNextRender.
    TestBed.flushEffects(); 
    await new Promise(r => setTimeout(r, 0));
  };

  it('src está vacío antes de que el observer dispare', async () => {
    await triggerAfterNextRender();
    
    expect(img.getAttribute('src')).toBeNull();
    expect(mockObserve).toHaveBeenCalledWith(img);
  });

  it('src se asigna a lazySrc cuando isIntersecting es true', async () => {
    await triggerAfterNextRender();
    
    const callback = (global as any).__intersectionObserverCallback;
    callback([{ isIntersecting: true }]);
    
    expect(img.src).toContain('test.jpg');
  });

  it('disconnect() es llamado tras la primera intersección', async () => {
    await triggerAfterNextRender();
    
    const callback = (global as any).__intersectionObserverCallback;
    callback([{ isIntersecting: true }]);
    
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('fallback asigna src directamente cuando IntersectionObserver no existe en window', async () => {
    delete (global as any).IntersectionObserver;

    // Reimitar directiva bajo el nuevo contexto (sin Observer nativo)
    TestBed.runInInjectionContext(() => {
      directive = new LazyImageDirective();
      Object.defineProperty(directive, 'lazySrc', { get: () => signal('test.jpg') });
    });

    await triggerAfterNextRender();

    expect(img.src).toContain('test.jpg');
    expect(mockObserve).not.toHaveBeenCalled();
  });
});
