import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonCardComponent } from './skeleton-card';
import { describe, it, expect, beforeEach } from 'vitest';
import { By } from '@angular/platform-browser';

describe('SkeletonCardComponent', () => {
  let component: SkeletonCardComponent;
  let fixture: ComponentFixture<SkeletonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería renderizar sin errores y sin requerir inputs', () => {
    expect(component).toBeTruthy();
  });

  it('el elemento raíz (div) del template debería contener las clases de Tailwind pre-establecidas incluyendo animate-shimmer', () => {
    const div = fixture.debugElement.query(By.css('div')).nativeElement;
    expect(div.className).toContain('animate-shimmer');
    expect(div.className).toContain('aspect-poster');
    expect(div.className).toContain('bg-linear-to-r');
  });
});
