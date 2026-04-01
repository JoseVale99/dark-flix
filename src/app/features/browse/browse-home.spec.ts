import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowseHomeComponent } from './browse-home';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Subject } from 'rxjs';
import { WpMediaService } from '@services/wp-media';
import { WpPost } from '@models/wp-post.model';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

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
      id: i, title: { rendered: 'Mock ' + i }, meta: { quality: '1080p', year: '2025' }
    } as unknown as WpPost));
    
    fixture.detectChanges();
    mockBackendSubject.next(mockedPosts);
    fixture.detectChanges();

    expect(component.posts().length).toBe(15);
    
    // Verificamos de forma segura buscando los components en crudo por etiqueta
    const sliders = fixture.nativeElement.querySelectorAll('df-media-slider');
    expect(sliders.length).toBeGreaterThan(0);
    
    const hero = fixture.nativeElement.querySelector('df-hero-banner');
    expect(hero).toBeTruthy();
  });
});
