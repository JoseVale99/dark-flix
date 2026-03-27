import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LazyImageDirective } from './lazy-image';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

@Component({
  template: '<img dfLazyImage [lazySrc]="source" />',
  imports: [LazyImageDirective]
})
class TestHostComponent {
  source: string | null = 'test.jpg';
}

describe('LazyImageDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let imgEl: HTMLImageElement;
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

    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    imgEl = fixture.nativeElement.querySelector('img');
  });

  afterEach(() => {
    global.IntersectionObserver = originalIntersectionObserver;
    delete (global as any).__intersectionObserverCallback;
    vi.clearAllMocks();
  });

  it('src está vacío antes de que el observer dispare', () => {
    fixture.detectChanges(); // Trigger ngOnInit
    expect(imgEl.getAttribute('src')).toBeNull();
    expect(mockObserve).toHaveBeenCalledWith(imgEl);
  });

  it('src se asigna a lazySrc cuando isIntersecting es true', () => {
    fixture.detectChanges();
    
    // Simular que el elemento entra en viewport
    const callback = (global as any).__intersectionObserverCallback;
    callback([{ isIntersecting: true }]);
    
    expect(imgEl.src).toContain('test.jpg');
  });

  it('disconnect() es llamado tras la primera intersección', () => {
    fixture.detectChanges();
    const callback = (global as any).__intersectionObserverCallback;
    callback([{ isIntersecting: true }]);
    
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('fallback asigna src directamente cuando IntersectionObserver no existe en window', () => {
    // Eliminar temporalmente IntersectionObserver para forzar fallback
    delete (global as any).IntersectionObserver;

    const fallbackFixture = TestBed.createComponent(TestHostComponent);
    fallbackFixture.detectChanges(); // trigger ngOnInit

    const fallbackImgEl = fallbackFixture.nativeElement.querySelector('img');
    expect(fallbackImgEl.src).toContain('test.jpg');
    // Observer no debió haber sido llamado porque no existe
    expect(mockObserve).not.toHaveBeenCalled();
  });
});
