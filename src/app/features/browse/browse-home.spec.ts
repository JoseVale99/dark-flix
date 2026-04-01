import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowseHomeComponent } from './browse-home';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Subject } from 'rxjs';
import { WpMediaService } from '@services/wp-media';
import { ApiMedia } from '@models';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BrowseHomeComponent', () => {
  let component: BrowseHomeComponent;
  let fixture: ComponentFixture<BrowseHomeComponent>;
  let mockHeroSubject: Subject<ApiMedia[] | null>;
  let mockCatalogSubject: Subject<ApiMedia[] | null>;

  beforeEach(async () => {
    mockHeroSubject = new Subject<ApiMedia[] | null>();
    mockCatalogSubject = new Subject<ApiMedia[] | null>();

    const mockWpMediaService = {
      getMediaSliders: vi.fn().mockReturnValue(mockHeroSubject.asObservable()),
      getMediaCatalog: vi.fn().mockReturnValue(mockCatalogSubject.asObservable())
    };

    await TestBed.configureTestingModule({
      imports: [BrowseHomeComponent],
      providers: [
        provideRouter([]),
        { provide: WpMediaService, useValue: mockWpMediaService }
      ]
    })
    .overrideComponent(BrowseHomeComponent, { 
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] } 
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseHomeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza estructura base y sliders', () => {
    // Injectar datos falsos
    const mockedPosts = Array.from({ length: 15 }).map((_, i) => ({
      _id: i, title: 'Mock ' + i, quality: [544], release_date: '2025-01-01'
    } as unknown as ApiMedia));
    
    fixture.detectChanges();
    mockHeroSubject.next([mockedPosts[0]]);
    mockCatalogSubject.next(mockedPosts);
    fixture.detectChanges();

    expect(component.posts().length).toBe(15);
    
    // Verificamos de forma segura buscando los components en crudo por etiqueta
    const sliders = fixture.nativeElement.querySelectorAll('df-media-slider');
    expect(sliders.length).toBeGreaterThan(0);
    
    const hero = fixture.nativeElement.querySelector('df-hero-banner');
    expect(hero).toBeTruthy();
  });
});
