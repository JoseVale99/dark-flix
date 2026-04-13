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

  it('getPagedCatalog() hace petición GET a listado y emite posts descapsulados', () => {
    const mockPosts: ApiMedia[] = [
      { _id: 1, title: 'Breaking Bad' } as unknown as ApiMedia,
      { _id: 2, title: 'Stranger Things' } as unknown as ApiMedia
    ];

    const mockResponse: ApiMediaResponse = {
       error: false,
       message: '',
       data: { 
         posts: mockPosts,
         pagination: { current_page: 1, last_page: 1 } 
       }
    };

    service.getPagedCatalog('movies').subscribe(res => {
      expect(res.posts.length).toBe(2);
      expect(res.posts[0].title).toBe('Breaking Bad');
      expect(res.posts[1].title).toBe('Stranger Things');
      expect(res.hasMore).toBe(false);
    });

    // Validar HTTP Request mock
    const req = httpTesting.expectOne(`/wp-api/v1/listing/movies?page=1&orderBy=latest&order=desc&postType=movies&postsPerPage=24`);
    expect(req.request.method).toEqual('GET');

    // Emitir mock
    req.flush(mockResponse);
  });
});
