import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WpMediaService } from './wp-media';
import { ApiMedia, ApiMediaResponse } from '@models';
import { environment } from '@env';

describe('WpMediaService', () => {
  let service: WpMediaService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WpMediaService,
        provideHttpClient(),
        provideHttpClientTesting()
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

  it('getMediaCatalog() hace petición GET a listado y emite posts descapsulados', () => {
    const mockPosts: ApiMedia[] = [
      { _id: 1, title: 'Breaking Bad' } as ApiMedia,
      { _id: 2, title: 'Stranger Things' } as ApiMedia
    ];

    const mockResponse: ApiMediaResponse = {
       error: false,
       message: '',
       data: { posts: mockPosts }
    };

    service.getMediaCatalog().subscribe(posts => {
      expect(posts.length).toBe(2);
      expect(posts[0].title).toBe('Breaking Bad');
      expect(posts[1].title).toBe('Stranger Things');
    });

    // Validar HTTP Request mock
    const req = httpTesting.expectOne(`https://hackstore.mx/wp-api/v1/listing/movies?page=1&orderBy=latest&order=desc&postType=movies&postsPerPage=12`);
    expect(req.request.method).toEqual('GET');

    // Emitir mock
    req.flush(mockResponse);
  });
});
