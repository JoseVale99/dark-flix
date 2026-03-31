import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowseHomeComponent } from './browse-home';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { WpMediaService } from '../../core/services/wp-media';
import { WpPost } from '../../core/models/wp-post.model';
import { MediaGridComponent } from '../../shared/components/media-grid/media-grid';

describe('BrowseHomeComponent', () => {
  let component: BrowseHomeComponent;
  let fixture: ComponentFixture<BrowseHomeComponent>;
  let mockBackendSubject: Subject<WpPost[] | null>;

  beforeEach(async () => {
    mockBackendSubject = new Subject<WpPost[] | null>();

    const mockWpMediaService = {
      getMediaCatalog: vi.fn().mockReturnValue(mockBackendSubject.asObservable())
    };

    await TestBed.configureTestingModule({
      imports: [BrowseHomeComponent],
      providers: [
        { provide: WpMediaService, useValue: mockWpMediaService }
      ]
    })
    .overrideComponent(BrowseHomeComponent, { 
      remove: { imports: [MediaGridComponent] },
      add: { schemas: [NO_ERRORS_SCHEMA] } 
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseHomeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza esqueletos placeholder en estado Pending/Loading (undefined inicial de signal)', () => {
    // La suscripción arranca, pero el Subject no emite nada al toque (esperando HTTP)
    fixture.detectChanges();
    
    // Debería dibujar n skeletons simulando grids cargando
    const skeletons = fixture.nativeElement.querySelectorAll('df-skeleton-card');
    expect(skeletons.length).toBe(12);
  });

  it('renderiza el Error Feedback State tras un fallo HTTP (catchError of(null))', () => {
    fixture.detectChanges();

    // Rxjs Catch Error dispara of(null), nuestro test trigger emit null simulado
    mockBackendSubject.next(null);
    fixture.detectChanges();

    const emptyWrapper = fixture.nativeElement.querySelector('.py-20.text-center');
    expect(emptyWrapper.textContent).toContain('No hemos encontrado contenido disponible');
    expect(fixture.nativeElement.querySelectorAll('df-skeleton-card').length).toBe(0);
  });

  it('renderiza la MediaGrid tras resolución satisfactoria en el servicio', () => {
    fixture.detectChanges();

    const result = [{ id: 1, title: { rendered: 'Dark' } } as WpPost];
    mockBackendSubject.next(result);
    fixture.detectChanges();

    const mediaGrid = fixture.nativeElement.querySelector('df-media-grid');
    expect(mediaGrid).toBeTruthy();
    expect(component.posts()?.length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('df-skeleton-card').length).toBe(0);
  });
});
