import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent, qualityClass } from './badge';
import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { signal, WritableSignal } from '@angular/core';

describe('BadgeComponent', () => {
  let component: BadgeComponent;
  let fixture: ComponentFixture<BadgeComponent>;
  let textSignal: WritableSignal<string>;
  let variantSignal: WritableSignal<'accent' | 'default' | 'quality'>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;

    // Bypass de compilador JIT en Vitest: Reemplazar los inputs Signal rotos con WritableSignals reales
    textSignal = signal('');
    variantSignal = signal('default');
    Object.defineProperty(component, 'text', { get: () => textSignal });
    Object.defineProperty(component, 'variant', { get: () => variantSignal });
  });

  // Property Tests (PBT)
  it('Propiedad 3: Badge renderiza el texto recibido', () => {
    fc.assert(
      fc.property(fc.string(), (randomText) => {
        textSignal.set(randomText);
        variantSignal.set('default');
        fixture.detectChanges();
        
        const span = fixture.nativeElement.querySelector('span');
        expect(span.textContent).toBe(randomText);
      }),
      { numRuns: 100 }
    );
  });

  it('Propiedad 4: Badge variant accent aplica clase bg-df-accent', () => {
    fc.assert(
      fc.property(fc.string(), (randomText) => {
        textSignal.set(randomText);
        variantSignal.set('accent');
        fixture.detectChanges();
        
        const span = fixture.nativeElement.querySelector('span');
        expect(span.className).toContain('bg-df-accent');
      }),
      { numRuns: 100 }
    );
  });

  it('Propiedad 5: Badge variant default aplica clases bg-df-card y border-df-border', () => {
    fc.assert(
      fc.property(fc.string(), (randomText) => {
        textSignal.set(randomText);
        variantSignal.set('default');
        fixture.detectChanges();
        
        const span = fixture.nativeElement.querySelector('span');
        expect(span.className).toContain('bg-df-card');
        expect(span.className).toContain('border-df-border');
      }),
      { numRuns: 100 }
    );
  });

  // Unit Tests concretos (casos de la variante 'quality')
  describe('qualityClass pura funcional', () => {
    it('aplica clase bg-purple-700 para texto 4K o UHD', () => {
      expect(qualityClass('4K')).toContain('bg-purple-700');
      expect(qualityClass('UHD')).toContain('bg-purple-700');
    });

    it('aplica clase bg-blue-700 para texto HD o 1080', () => {
      expect(qualityClass('HD')).toContain('bg-blue-700');
      expect(qualityClass('1080P')).toContain('bg-blue-700');
    });

    it('aplica clase bg-yellow-600 para texto CAM o TS', () => {
      expect(qualityClass('CAMRip')).toContain('bg-yellow-600');
      expect(qualityClass('TS')).toContain('bg-yellow-600');
    });
  });

  it('variant quality aplica las clases usando la función evaluadora dinámicamente', () => {
    textSignal.set('4K Ultra');
    variantSignal.set('quality');
    fixture.detectChanges();
    
    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-purple-700');
  });
});
