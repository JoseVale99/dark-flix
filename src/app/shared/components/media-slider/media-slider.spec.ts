import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaSliderComponent } from './media-slider';
import { describe, it, expect, beforeEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MediaSliderComponent', () => {
  let component: MediaSliderComponent;
  let fixture: ComponentFixture<MediaSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaSliderComponent]
    }).overrideComponent(MediaSliderComponent, {
      set: { schemas: [NO_ERRORS_SCHEMA] }
    }).compileComponents();

    fixture = TestBed.createComponent(MediaSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse exitosamente', () => {
    expect(component).toBeTruthy();
    expect(component.title()).toBe('Explorar');
  });

  it('debe tener un array vacío de items por defecto', () => {
    expect(component.mediaItems().length).toBe(0);
  });
});
