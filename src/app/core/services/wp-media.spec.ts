import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WpMediaService } from './wp-media';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WpPost } from '@models/wp-post.model';
import { environment } from '@env';

describe('WpMediaService', () => {
  let service: WpMediaService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(), // El emulador/mock de llamadas asíncronas
        WpMediaService
      ]
    });

    service = TestBed.inject(WpMediaService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Asegurarse de que no haya mutaciones fantasma en memoria tras un test 
    httpTesting.verify();
  });

  it('debe crearse exitosamente', () => {
    expect(service).toBeTruthy();
  });

  it('getMediaCatalog() hace petici\u00f3n GET a /wp-json/wp/v2/posts?_embed y emite posts', () => {
    const mockPosts: WpPost[] = [
      { id: 101, title: { rendered: 'Dark' } } as WpPost,
      { id: 202, title: { rendered: 'Stranger Things' } } as WpPost
    ];

    // Subscribirse al cold observable
    service.getMediaCatalog().subscribe((posts) => {
      expect(posts.length).toBe(2);
      expect(posts[0].id).toBe(101);
      expect(posts[1].title.rendered).toBe('Stranger Things');
    });

    // Validar HTTP Request mock
    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/posts?_embed`);
    expect(req.request.method).toEqual('GET');

    // Despachar mock data al pipeline que espera los resultados
    req.flush(mockPosts);
  });
});
