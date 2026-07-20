# DarkFlix — Arquitectura Frontend Angular 21

> Plataforma de streaming inspirada en hackstore.mx, consumiendo su API WordPress REST directamente.
> Sin backend propio. Angular 21 como SPA headless sobre WP REST API.

---

## Índice

1. [Stack tecnológico](#1-stack-tecnológico)
2. [API Source — hackstore.mx](#2-api-source--hackstoremx)
3. [Endpoints disponibles (WP REST API)](#3-endpoints-disponibles-wp-rest-api)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Arquitectura de componentes](#5-arquitectura-de-componentes)
6. [State Management](#6-state-management)
7. [Routing](#7-routing)
8. [Capa de servicios API](#8-capa-de-servicios-api)
9. [Performance](#9-performance)
10. [TailwindCSS — Estándar 100%](#10-tailwindcss--estándar-100)
11. [Barra de carga (Progress Bar)](#11-barra-de-carga-progress-bar)
12. [UI Design System](#12-ui-design-system)
13. [Seguridad y consideraciones](#13-seguridad-y-consideraciones)
14. [MCPs recomendados para Kiro](#14-mcps-recomendados-para-kiro)
- [DarkFlix — Arquitectura Frontend Angular 21](#darkflix--arquitectura-frontend-angular-21)
  - [Índice](#índice)
  - [1. Stack tecnológico](#1-stack-tecnológico)
  - [2. API Source — hackstore.mx](#2-api-source--hackstoremx)
  - [3. Endpoints disponibles (WP REST API)](#3-endpoints-disponibles-wp-rest-api)
    - [3.1 Namespace principal — `wp/v2`](#31-namespace-principal--wpv2)
      - [Contenido (Custom Post Types)](#contenido-custom-post-types)
      - [Taxonomías (Filtros)](#taxonomías-filtros)
      - [Medios / Imágenes](#medios--imágenes)
      - [Usuarios (futuro — cuentas)](#usuarios-futuro--cuentas)
    - [3.2 Autenticación WP](#32-autenticación-wp)
    - [3.3 Búsqueda global](#33-búsqueda-global)
    - [3.4 Query params comunes (WP REST API estándar)](#34-query-params-comunes-wp-rest-api-estándar)
    - [3.5 Optimización con `_fields` y `_embed`](#35-optimización-con-_fields-y-_embed)
    - [3.6 Headers de respuesta útiles](#36-headers-de-respuesta-útiles)
  - [4. Estructura de carpetas](#4-estructura-de-carpetas)
  - [5. Arquitectura de componentes](#5-arquitectura-de-componentes)
    - [Smart vs Dumb](#smart-vs-dumb)
  - [6. State Management](#6-state-management)
    - [Catalog Store](#catalog-store)
  - [7. Routing](#7-routing)
  - [8. Capa de servicios API](#8-capa-de-servicios-api)
    - [Base service](#base-service)
    - [Movies service](#movies-service)
    - [Modelos WP](#modelos-wp)
  - [9. Performance](#9-performance)
    - [app.config.ts](#appconfigts)
  - [10. TailwindCSS — Estándar 100%](#10-tailwindcss--estándar-100)
    - [Regla de oro](#regla-de-oro)
    - [Configuración base](#configuración-base)
    - [Ejemplos de uso en templates](#ejemplos-de-uso-en-templates)
    - [Navbar con scroll behavior (Tailwind + Angular)](#navbar-con-scroll-behavior-tailwind--angular)
  - [11. Barra de carga (Progress Bar)](#11-barra-de-carga-progress-bar)
    - [Componente](#componente)
    - [Servicio](#servicio)
    - [Integración con el Router (navegación)](#integración-con-el-router-navegación)
    - [Integración con HTTP (requests API)](#integración-con-http-requests-api)
    - [Resultado visual](#resultado-visual)
  - [12. UI Design System](#12-ui-design-system)
    - [Tokens de color (TailwindCSS)](#tokens-de-color-tailwindcss)
    - [Componentes clave](#componentes-clave)
  - [13. Seguridad y consideraciones](#13-seguridad-y-consideraciones)
    - [CORS](#cors)
    - [Rate limiting](#rate-limiting)
    - [Tokens JWT](#tokens-jwt)
    - [Nota legal](#nota-legal)
  - [Diagrama de flujo](#diagrama-de-flujo)
  - [12. Diseño de pantallas](#12-diseño-de-pantallas)
    - [Logo](#logo)
      - [Anatomía del logo](#anatomía-del-logo)
      - [Especificaciones visuales](#especificaciones-visuales)
      - [Uso en la app](#uso-en-la-app)
      - [Reglas de uso del logo](#reglas-de-uso-del-logo)
      - [Animación glitch (opcional para splash)](#animación-glitch-opcional-para-splash)
    - [12.1 Pantalla — Home](#121-pantalla--home)
      - [Especificaciones Home](#especificaciones-home)
    - [12.2 Pantalla — Detail](#122-pantalla--detail)
      - [Especificaciones Detail](#especificaciones-detail)
    - [12.3 Pantalla — Player](#123-pantalla--player)
      - [Especificaciones Player](#especificaciones-player)
    - [12.4 Componente — MediaCard](#124-componente--mediacard)
    - [12.5 Navbar](#125-navbar)
    - [12.6 Bottom Navigation (mobile)](#126-bottom-navigation-mobile)
    - [12.7 Tipografía](#127-tipografía)
    - [12.8 Animaciones y transiciones](#128-animaciones-y-transiciones)
    - [12.9 Responsive breakpoints](#129-responsive-breakpoints)
    - [12.10 Paleta completa](#1210-paleta-completa)
  - [14. MCPs recomendados para Kiro](#14-mcps-recomendados-para-kiro)
    - [MCP instalado actualmente](#mcp-instalado-actualmente)
    - [MCPs adicionales recomendados para este proyecto](#mcps-adicionales-recomendados-para-este-proyecto)
    - [Para qué sirve cada uno en DarkFlix](#para-qué-sirve-cada-uno-en-darkflix)
    - [Flujos de trabajo con MCPs activos](#flujos-de-trabajo-con-mcps-activos)
    - [Cómo instalar un MCP en Kiro](#cómo-instalar-un-mcp-en-kiro)

---

## 1. Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | Angular 21 | Standalone components, signals, zoneless |
| State | @ngrx/signals (Signal Store) | Sin boilerplate, reactivo, tree-shakeable |
| Estilos | TailwindCSS 4 | Utility-first, dark mode nativo |
| Player | hls.js + Video.js | HLS adaptive bitrate, subtítulos |
| HTTP | Angular HttpClient (withFetch) | Fetch API nativa, interceptores funcionales |
| Routing | Angular Router (lazy loading) | Code splitting por feature |
| Testing | Vitest + Testing Library | Más rápido que Jest, compatible con Vite |
| Linting | ESLint + Prettier | Consistencia de código |

---

## 2. API Source — hackstore.mx

hackstore.mx usa una **API custom** sobre WordPress en el namespace `/wp-api/v1/`.
NO usa la WP REST API estándar (`/wp-json/wp/v2/`).

**Base URL:**
```
https://hackstore.mx/wp-api/v1
```

**Endpoints principales:**
```
GET /wp-api/v1/listing/movies    — catálogo de películas
GET /wp-api/v1/listing/series    — catálogo de series
GET /wp-api/v1/listing/animes    — catálogo de anime
```

**Parámetros de query:**
| Param | Tipo | Descripción |
|---|---|---|
| `filter` | string (JSON) | Filtros serializados: `{"genres":[855],"countries":[910],"years":[52]}` |
| `page` | number | Página actual |
| `orderBy` | string | `latest`, `rating`, `title`, `year` |
| `order` | string | `asc`, `desc` |
| `postType` | string | `movies`, `series`, `animes` |
| `postsPerPage` | number | Items por página (default: 18) |

**Ejemplo de request con múltiples filtros:**
```
GET /wp-api/v1/listing/movies?filter=%7B%22genres%22%3A%5B855%5D%2C%22countries%22%3A%5B910%2C728%5D%2C%22years%22%3A%5B52%5D%7D&page=1&orderBy=latest&order=desc&postType=movies&postsPerPage=18
```

Decodificado:
```json
{
  "filter": { "genres": [855], "countries": [910, 728], "years": [52] },
  "page": 1,
  "orderBy": "latest",
  "order": "desc",
  "postType": "movies",
  "postsPerPage": 18
}
```

---

## 3. Endpoints disponibles (WP REST API)

### 3.1 Namespace principal — `wp/v2`

#### Contenido (Custom Post Types)

```
# Películas
GET /wp-json/wp/v2/pelicula
GET /wp-json/wp/v2/pelicula?page=1&per_page=20
GET /wp-json/wp/v2/pelicula/{id}
GET /wp-json/wp/v2/pelicula?search={query}
GET /wp-json/wp/v2/pelicula?genero={term_id}
GET /wp-json/wp/v2/pelicula?anio={year}
GET /wp-json/wp/v2/pelicula?orderby=date&order=desc
GET /wp-json/wp/v2/pelicula?orderby=title&order=asc

# Series
GET /wp-json/wp/v2/serie
GET /wp-json/wp/v2/serie?page=1&per_page=20
GET /wp-json/wp/v2/serie/{id}
GET /wp-json/wp/v2/serie?search={query}

# Anime
GET /wp-json/wp/v2/anime
GET /wp-json/wp/v2/anime?page=1&per_page=20
GET /wp-json/wp/v2/anime/{id}

# Posts generales (noticias/blog del sitio)
GET /wp-json/wp/v2/posts
GET /wp-json/wp/v2/posts/{id}
```

> Nota: Los slugs exactos del custom post type (`pelicula`, `serie`, `anime`)
> pueden variar. Verificar con `GET /wp-json/wp/v2/types` para obtener
> el listado real de post types registrados.

#### Taxonomías (Filtros)

```
# Géneros
GET /wp-json/wp/v2/genero
GET /wp-json/wp/v2/genero?per_page=100

# Año de lanzamiento
GET /wp-json/wp/v2/anio
GET /wp-json/wp/v2/anio?per_page=50

# Idioma / Audio
GET /wp-json/wp/v2/idioma

# Calidad (HD, 4K, CAM, etc.)
GET /wp-json/wp/v2/calidad

# País de origen
GET /wp-json/wp/v2/pais

# Listado de todas las taxonomías registradas
GET /wp-json/wp/v2/taxonomies
```

#### Medios / Imágenes

```
# Poster / backdrop de un contenido
GET /wp-json/wp/v2/media/{id}
GET /wp-json/wp/v2/media?parent={post_id}
```

#### Usuarios (futuro — cuentas)

```
GET /wp-json/wp/v2/users/{id}
POST /wp-json/wp/v2/users          # requiere auth
```

### 3.2 Autenticación WP

```
# JWT Authentication (plugin: JWT Auth WP)
POST /wp-json/jwt-auth/v1/token
  Body: { username, password }
  Response: { token, user_email, user_nicename, user_display_name }

POST /wp-json/jwt-auth/v1/token/validate
  Header: Authorization: Bearer {token}
```

### 3.3 Búsqueda global

```
GET /wp-json/wp/v2/search?search={query}&type=post&subtype=pelicula
GET /wp-json/wp/v2/search?search={query}&type=post&subtype=serie
GET /wp-json/wp/v2/search?search={query}&type=post          # todos los tipos
```

### 3.4 Query params comunes (WP REST API estándar)

| Parámetro | Tipo | Descripción |
|---|---|---|
| `page` | number | Página actual (default: 1) |
| `per_page` | number | Items por página (max: 100) |
| `search` | string | Búsqueda full-text |
| `orderby` | string | `date`, `title`, `relevance`, `modified` |
| `order` | string | `asc`, `desc` |
| `status` | string | `publish` (siempre en frontend) |
| `_fields` | string | Campos a retornar (optimización) |
| `_embed` | boolean | Incluye featured media y taxonomías embebidas |

### 3.5 Optimización con `_fields` y `_embed`

```
# Solo traer campos necesarios para la card (evita payload enorme)
GET /wp-json/wp/v2/pelicula?_fields=id,title,slug,featured_media,excerpt,meta&_embed

# Con embed trae el poster directamente sin segunda request
GET /wp-json/wp/v2/pelicula?_embed&per_page=20
# Response incluye: _embedded['wp:featuredmedia'][0].source_url
```

### 3.6 Headers de respuesta útiles

```
X-WP-Total: 847          # total de items
X-WP-TotalPages: 43      # total de páginas
```

Usar estos headers para paginación infinita y virtual scroll.

---

## 4. Estructura de carpetas

```
src/
├── app/
│   ├── core/
│   │   ├── api/
│   │   │   ├── wp-api.service.ts          # cliente base WP REST
│   │   │   ├── movies.service.ts
│   │   │   ├── series.service.ts
│   │   │   ├── anime.service.ts
│   │   │   ├── taxonomy.service.ts
│   │   │   └── search.service.ts
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   └── auth.interceptor.ts
│   │   ├── models/
│   │   │   ├── wp-post.model.ts           # modelo base WP
│   │   │   ├── movie.model.ts
│   │   │   ├── series.model.ts
│   │   │   ├── episode.model.ts
│   │   │   ├── taxonomy.model.ts
│   │   │   └── wp-response.model.ts       # paginación headers
│   │   └── interceptors/
│   │       ├── auth.interceptor.ts
│   │       └── cache.interceptor.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── media-card/
│   │   │   ├── skeleton-card/
│   │   │   ├── badge/
│   │   │   ├── modal/
│   │   │   └── rating/
│   │   ├── directives/
│   │   │   ├── lazy-image.directive.ts
│   │   │   └── infinite-scroll.directive.ts
│   │   └── pipes/
│   │       ├── wp-image.pipe.ts           # extrae URL de _embedded
│   │       └── duration.pipe.ts
│   │
│   ├── features/
│   │   ├── home/
│   │   │   ├── home.component.ts
│   │   │   ├── home.routes.ts
│   │   │   └── components/
│   │   │       ├── hero-banner/
│   │   │       └── content-row/
│   │   │
│   │   ├── catalog/
│   │   │   ├── catalog.component.ts
│   │   │   ├── catalog.routes.ts
│   │   │   ├── catalog.store.ts
│   │   │   └── components/
│   │   │       ├── filter-bar/
│   │   │       └── media-grid/
│   │   │
│   │   ├── detail/
│   │   │   ├── detail.component.ts
│   │   │   ├── detail.routes.ts
│   │   │   └── components/
│   │   │       ├── media-info/
│   │   │       ├── player-embed/          # iframe/embed del player externo
│   │   │       └── related-content/
│   │   │
│   │   ├── search/
│   │   │   ├── search.component.ts
│   │   │   └── search.routes.ts
│   │   │
│   │   └── auth/
│   │       ├── login/
│   │       └── register/
│   │
│   ├── layout/
│   │   ├── navbar/
│   │   └── footer/
│   │
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.ts
```

---

## 5. Arquitectura de componentes

### Smart vs Dumb

```
Smart (Container)              Dumb (Presentational)
─────────────────              ─────────────────────
home.component                 media-card
catalog.component              filter-bar
detail.component               hero-banner
search.component               content-row
                               skeleton-card
                               badge
                               rating
```

**Regla:** Los componentes dumb solo reciben `input()` signals y emiten `output()`.
Nunca inyectan servicios directamente.

```typescript
// shared/components/media-card/media-card.component.ts
@Component({ ... })
export class MediaCardComponent {
  media    = input.required<WpPost>();
  onSelect = output<WpPost>();
}
```

---

## 6. State Management

Usamos **@ngrx/signals** (Signal Store). Sin NgRx completo, sin boilerplate.

### Catalog Store

```typescript
// features/catalog/catalog.store.ts
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { MoviesService } from '@api/movies';

type CatalogState = {
  items: WpPost[];
  total: number;
  page: number;
  filters: CatalogFilters;
  loading: boolean;
  error: string | null;
};

export const CatalogStore = signalStore(
  withState<CatalogState>({
    items: [], total: 0, page: 1,
    filters: {}, loading: false, error: null
  }),
  withComputed(({ items, total, page }) => ({
    hasMore: computed(() => items().length < total()),
    currentPage: computed(() => page()),
  })),
  withMethods((store, svc = inject(MoviesService)) => ({
    async loadMore() {
      if (store.loading()) return;
      patchState(store, { loading: true });
      try {
        const { data, total } = await svc.getMovies(store.filters(), store.page());
        patchState(store, {
          items: [...store.items(), ...data],
          total,
          page: store.page() + 1,
          loading: false,
        });
      } catch (e) {
        patchState(store, { error: 'Error cargando contenido', loading: false });
      }
    },
    applyFilters(filters: CatalogFilters) {
      patchState(store, { filters, items: [], page: 1, total: 0 });
      this.loadMore();
    },
    reset() {
      patchState(store, { items: [], page: 1, total: 0, filters: {} });
    }
  }))
);
```

---

## 7. Routing

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'peliculas',
    loadChildren: () => import('./features/catalog/catalog.routes')
  },
  {
    path: 'series',
    loadChildren: () => import('./features/catalog/catalog.routes')
  },
  {
    path: 'anime',
    loadChildren: () => import('./features/catalog/catalog.routes')
  },
  {
    path: 'detalle/:type/:slug',
    loadChildren: () => import('./features/detail/detail.routes')
  },
  {
    path: 'buscar',
    loadComponent: () => import('./features/search/search.component')
      .then(m => m.SearchComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
  },
  { path: '**', redirectTo: '' }
];
```

---

## 8. Capa de servicios API

### Base service

```typescript
// core/api/wp-api.service.ts
@Injectable({ providedIn: 'root' })
export class WpApiService {
  private http = inject(HttpClient);
  readonly BASE = 'https://hackstore.mx/wp-json/wp/v2';

  get<T>(endpoint: string, params: Record<string, any> = {}) {
    return this.http.get<T>(`${this.BASE}/${endpoint}`, {
      params: { status: 'publish', ...params },
      observe: 'response'   // para leer X-WP-Total del header
    });
  }
}
```

### Movies service

```typescript
// core/api/movies.service.ts
@Injectable({ providedIn: 'root' })
export class MoviesService {
  private api = inject(WpApiService);

  getMovies(filters: CatalogFilters = {}, page = 1) {
    return this.api.get<WpPost[]>('pelicula', {
      page,
      per_page: 20,
      _embed: true,
      _fields: 'id,title,slug,excerpt,featured_media,meta,_links',
      ...this.buildFilterParams(filters)
    }).pipe(
      map(res => ({
        data: res.body ?? [],
        total: Number(res.headers.get('X-WP-Total') ?? 0)
      }))
    );
  }

  getMovieBySlug(slug: string) {
    return this.api.get<WpPost[]>('pelicula', {
      slug,
      _embed: true
    }).pipe(map(res => res.body?.[0]));
  }

  private buildFilterParams(filters: CatalogFilters) {
    const params: Record<string, any> = {};
    if (filters.genre)    params['genero'] = filters.genre;
    if (filters.year)     params['anio'] = filters.year;
    if (filters.language) params['idioma'] = filters.language;
    if (filters.quality)  params['calidad'] = filters.quality;
    if (filters.orderBy)  params['orderby'] = filters.orderBy;
    return params;
  }
}
```

### Modelos WP

```typescript
// core/models/wp-post.model.ts
export interface WpPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  meta: Record<string, any>;       // campos custom del tema
  _embedded?: {
    'wp:featuredmedia': WpMedia[];
    'wp:term': WpTerm[][];
  };
}

export interface WpMedia {
  id: number;
  source_url: string;
  media_details: {
    sizes: {
      full: { source_url: string };
      medium: { source_url: string };
      thumbnail: { source_url: string };
    }
  };
}

export interface WpTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface WpPaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
}
```

---

## 9. Performance

| Técnica | Implementación |
|---|---|
| Lazy loading de rutas | `loadComponent` / `loadChildren` en todas las rutas |
| Virtual scroll | `CdkVirtualScrollViewport` en catálogo (1000+ items) |
| Lazy images | `IntersectionObserver` directive en posters |
| `_fields` param | Solo pedir campos necesarios a la API |
| `_embed` | Evitar segunda request para imágenes |
| HTTP cache | Interceptor con `Map<url, Observable>` TTL 5min |
| `@defer` | Bloques diferidos para contenido below-fold |
| Zoneless | `provideZonelessChangeDetection()` |
| `trackBy` | En todos los `@for` loops |

### app.config.ts

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules), withViewTransitions()),
    provideHttpClient(withFetch(), withInterceptors([cacheInterceptor, progressInterceptor])),
  ]
};
```

---

## 10. TailwindCSS — Estándar 100%

TailwindCSS es el **único sistema de estilos** del proyecto. No se escribe CSS custom salvo para tokens de diseño en `tailwind.config.js` y animaciones que Tailwind no cubre nativamente.

### Regla de oro

```
❌ NO  →  styles.css con clases custom
❌ NO  →  ::ng-deep, ViewEncapsulation.None para estilos globales
❌ NO  →  style="..." inline en templates
✅ SÍ  →  clases Tailwind directamente en el template
✅ SÍ  →  @apply solo en componentes de librería reutilizables
✅ SÍ  →  tailwind.config.js para tokens del design system
```

### Configuración base

```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',   // dark mode manual (siempre activo en DarkFlix)
  theme: {
    extend: {
      colors: {
        'df-bg':       '#0a0a0a',
        'df-surface':  '#141414',
        'df-card':     '#1a1a1a',
        'df-border':   '#2a2a2a',
        'df-accent':   '#e50914',
        'df-accent-h': '#f40612',
        'df-text':     '#ffffff',
        'df-muted':    '#b3b3b3',
        'df-dim':      '#666666',
        'df-imdb':     '#f5c518',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      aspectRatio: {
        'poster': '2 / 3',
        'backdrop': '16 / 9',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, transparent 40%, #0a0a0a 100%)',
        'card-gradient': 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
        'player-top':    'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
        'player-bottom': 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
      },
      keyframes: {
        'glitch': {
          '0%, 100%': { clipPath: 'inset(0 0 95% 0)', transform: 'translateX(-4px)' },
          '25%':      { clipPath: 'inset(30% 0 50% 0)', transform: 'translateX(4px)' },
          '50%':      { clipPath: 'inset(60% 0 20% 0)', transform: 'translateX(-2px)' },
          '75%':      { clipPath: 'inset(80% 0 5% 0)', transform: 'translateX(2px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'progress-indeterminate': {
          '0%':   { left: '-40%', width: '40%' },
          '60%':  { left: '100%', width: '40%' },
          '100%': { left: '100%', width: '40%' },
        },
      },
      animation: {
        'glitch':    'glitch 3s infinite',
        'shimmer':   'shimmer 1.5s infinite linear',
        'progress':  'progress-indeterminate 1.4s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
```

### Ejemplos de uso en templates

```html
<!-- MediaCard — 100% Tailwind -->
<div class="group relative aspect-poster bg-df-card rounded overflow-hidden cursor-pointer
            transition-transform duration-200 hover:scale-105 hover:ring-2 hover:ring-df-accent">

  <img [src]="posterUrl" [alt]="title"
       class="w-full h-full object-cover"
       loading="lazy" />

  <!-- overlay hover -->
  <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
              transition-opacity duration-150 flex flex-col justify-end p-3">
    <span class="text-white font-semibold text-sm truncate">{{ title }}</span>
    <span class="text-df-muted text-xs">{{ year }} · {{ quality }}</span>
  </div>

  <!-- badge calidad -->
  <span class="absolute top-2 left-2 bg-df-accent text-white
               text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">
    {{ quality }}
  </span>
</div>

<!-- Botón primario -->
<button class="flex items-center gap-2 bg-df-accent hover:bg-df-accent-h
               text-white font-bold px-6 py-3 rounded transition-colors duration-150">
  <svg><!-- play icon --></svg>
  PLAY NOW
</button>

<!-- Botón secundario (ghost) -->
<button class="flex items-center gap-2 bg-white/15 hover:bg-white/25
               text-white font-semibold px-6 py-3 rounded backdrop-blur-sm
               transition-colors duration-150">
  MORE INFO
</button>

<!-- Badge género -->
<span class="bg-df-card border border-df-border text-df-muted
             text-xs uppercase tracking-widest px-2 py-1 rounded">
  {{ genre }}
</span>

<!-- Skeleton loader -->
<div class="bg-gradient-to-r from-df-card via-df-surface to-df-card
            bg-[length:200%_100%] animate-shimmer rounded aspect-poster">
</div>
```

### Navbar con scroll behavior (Tailwind + Angular)

```html
<nav [class]="scrolled()
  ? 'fixed top-0 w-full z-50 bg-df-bg/95 backdrop-blur-md border-b border-df-border transition-all duration-300'
  : 'fixed top-0 w-full z-50 bg-transparent transition-all duration-300'">
```

```typescript
scrolled = signal(false);

constructor() {
  fromEvent(window, 'scroll')
    .pipe(map(() => window.scrollY > 50), distinctUntilChanged())
    .subscribe(v => this.scrolled.set(v));
}
```

---

## 11. Barra de carga (Progress Bar)

Barra de progreso fina en la parte superior de la pantalla, estilo NProgress/YouTube.
Se activa en cada navegación de ruta y en cada request HTTP pesado.

### Componente

```typescript
// shared/components/progress-bar/progress-bar.ts
@Component({
  selector: 'df-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none">
        <!-- barra principal -->
        <div
          class="h-full bg-df-accent transition-all duration-300 ease-out shadow-[0_0_8px_#e50914]"
          [style.width.%]="progress()"
        ></div>
        <!-- brillo en el extremo derecho -->
        <div
          class="absolute top-0 right-0 h-full w-24
                 bg-gradient-to-l from-white/40 to-transparent"
          [style.opacity]="progress() > 5 ? 1 : 0"
        ></div>
      </div>
    }
  `,
})
export class ProgressBarComponent {
  private progressSvc = inject(ProgressBarService);
  visible  = this.progressSvc.visible;
  progress = this.progressSvc.progress;
}
```

### Servicio

```typescript
// core/services/progress-bar.service.ts
@Injectable({ providedIn: 'root' })
export class ProgressBarService {
  visible  = signal(false);
  progress = signal(0);

  private timer: ReturnType<typeof setInterval> | null = null;

  start() {
    this.visible.set(true);
    this.progress.set(5);
    // simula progreso hasta 85% mientras carga
    this.timer = setInterval(() => {
      const current = this.progress();
      if (current < 85) {
        this.progress.update(p => p + Math.random() * 8);
      }
    }, 300);
  }

  complete() {
    if (this.timer) clearInterval(this.timer);
    this.progress.set(100);
    // ocultar tras la animación de completado
    setTimeout(() => {
      this.visible.set(false);
      this.progress.set(0);
    }, 400);
  }

  error() {
    if (this.timer) clearInterval(this.timer);
    this.visible.set(false);
    this.progress.set(0);
  }
}
```

### Integración con el Router (navegación)

```typescript
// app.ts
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ProgressBarComponent],
  template: `
    <df-progress-bar />
    <router-outlet />
  `,
})
export class AppComponent {
  private router      = inject(Router);
  private progressSvc = inject(ProgressBarService);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationStart)
    ).subscribe(() => this.progressSvc.start());

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd || e instanceof NavigationError)
    ).subscribe(() => this.progressSvc.complete());
  }
}
```

### Integración con HTTP (requests API)

```typescript
// core/interceptors/progress.interceptor.ts
export const progressInterceptor: HttpInterceptorFn = (req, next) => {
  const progressSvc = inject(ProgressBarService);

  // solo activar en requests de la API, no en assets
  if (!req.url.includes('wp-json')) return next(req);

  progressSvc.start();
  return next(req).pipe(
    finalize(() => progressSvc.complete())
  );
};
```

```typescript
// app.config.ts — registrar el interceptor
provideHttpClient(
  withFetch(),
  withInterceptors([authInterceptor, cacheInterceptor, progressInterceptor])
)
```

### Resultado visual

```
┌─────────────────────────────────────────────────────┐
│ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← 3px, rojo #e50914
│                                                     │     glow: 0 0 8px #e50914
│  DARKFLIX          🔍  ☰                           │  ← navbar debajo
└─────────────────────────────────────────────────────┘
```

- Altura: `3px`, posición `fixed top-0 z-[9999]`
- Color: `#e50914` con `box-shadow: 0 0 8px #e50914` (efecto glow)
- Brillo blanco en el extremo derecho mientras avanza
- Transición suave `ease-out 300ms`
- Al completar: llega a 100% y desaparece con fade

---

## 12. UI Design System

### Tokens de color (TailwindCSS)

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'df-bg':       '#0a0a0a',
      'df-surface':  '#141414',
      'df-card':     '#1a1a1a',
      'df-accent':   '#e50914',
      'df-accent-h': '#f40612',
      'df-text':     '#ffffff',
      'df-muted':    '#b3b3b3',
      'df-border':   '#2a2a2a',
    }
  }
}
```

### Componentes clave

```
MediaCard
  ├── poster (lazy image)
  ├── overlay en hover (play + info)
  ├── badges (calidad, año, idioma)
  └── título truncado

HeroBanner
  ├── backdrop full-width
  ├── gradient overlay bottom
  ├── título + descripción
  └── botones: Ver ahora / Más info

FilterBar (sticky)
  ├── pills por género
  ├── selects: año, idioma, calidad
  └── ordenar por: fecha, título, rating

ContentRow
  ├── título de sección
  ├── scroll horizontal con snap
  └── flechas de navegación
```

---

## 13. Seguridad y consideraciones

### CORS
hackstore.mx puede tener restricciones CORS para consumo desde otro dominio.
Opciones:

1. **Proxy en desarrollo** — configurar `proxy.conf.json` en Angular CLI
2. **Proxy en producción** — Nginx reverse proxy o Cloudflare Worker como middleware
3. **Verificar headers** — si el sitio permite `Access-Control-Allow-Origin: *`

```json
// proxy.conf.json (desarrollo)
{
  "/wp-json": {
    "target": "https://hackstore.mx",
    "changeOrigin": true,
    "secure": true
  }
}
```

### Rate limiting
La WP REST API no tiene rate limiting agresivo por defecto, pero:
- Cachear respuestas en el cliente (5 min TTL)
- No hacer requests en cada keystroke del search (debounce 400ms)
- Paginar correctamente, no pedir `per_page=100` siempre

### Tokens JWT
- Guardar en memoria (variable del servicio), no en `localStorage`
- Refresh automático antes de expiración
- Limpiar en logout

### Nota legal
Consumir la API de un tercero sin autorización explícita puede violar
sus términos de servicio. Se recomienda contactar a hackstore.mx para
obtener permiso formal o una API key si la ofrecen.

---

## Diagrama de flujo

```
Usuario
  │
  ▼
Angular SPA (DarkFlix)
  │
  ├── CatalogStore (Signal Store)
  │     ├── filters signal
  │     ├── items signal
  │     └── loading signal
  │
  ├── MoviesService / SeriesService / AnimeService
  │     └── WpApiService (HttpClient + cache interceptor)
  │
  ▼
hackstore.mx WP REST API
  ├── GET /wp-json/wp/v2/pelicula?_embed&per_page=20
  ├── GET /wp-json/wp/v2/serie?genero=5&page=2
  ├── GET /wp-json/wp/v2/search?search=batman
  └── GET /wp-json/wp/v2/genero?per_page=100
```

---

*Arquitectura diseñada para Angular 21 — Marzo 2026*

---

## 12. Diseño de pantallas

### Logo

**Archivo:** `public/images/logo/dark-flix.png`

#### Anatomía del logo

```
  ┌─────────────────────────────────────────────────┐
  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
  │  ░░  [glitch lines azul/púrpura ←←←←←←←]  ░░  │
  │  ░░                                         ░░  │
  │  ░░   DARK  ▶  FLIX                         ░░  │
  │  ░░  [blanco] [rojo] [rojo degradado]       ░░  │
  │  ░░                                         ░░  │
  │  ░░  [glitch lines rojo →→→→→→→→→→→→→]     ░░  │
  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
  └─────────────────────────────────────────────────┘
```

#### Especificaciones visuales

| Elemento | Detalle |
|---|---|
| "DARK" | Blanco puro `#ffffff`, sans-serif condensed black/900 |
| Separador ▶ | Triángulo play rojo `#e50914`, mismo tamaño que la tipografía |
| "FLIX" | Rojo degradado `#e50914 → #c0000a`, mismo peso que "DARK" |
| Efecto glitch | Líneas horizontales desplazadas: rojo `#e50914` + azul/púrpura `#6600ff` |
| Fondo | Negro puro `#000000` (el PNG tiene fondo negro, usar sobre fondos oscuros) |
| Tipografía base | Sans-serif condensed bold — estilo techno/cyberpunk |

#### Uso en la app

```html
<!-- Navbar — usar la imagen directamente -->
<img
  src="/images/logo/dark-flix.png"
  alt="DarkFlix"
  class="h-8 w-auto object-contain"
/>
```

```css
/* Tamaños por breakpoint */
.logo {
  height: 28px;   /* mobile */
}
@media (min-width: 1024px) {
  .logo {
    height: 36px; /* desktop */
  }
}
```

#### Reglas de uso del logo

| Contexto | Indicación |
|---|---|
| Navbar | `h-8` (32px), sobre fondo `#0a0a0a` |
| Splash / loading screen | `h-16` (64px), centrado, con animación glitch |
| Favicon | Usar solo el ▶ rojo recortado como ícono 32x32 |
| Footer | `h-6` (24px), opacidad 70% |
| NO usar sobre | Fondos claros — el logo tiene fondo negro integrado |
| NO distorsionar | Mantener siempre el aspect ratio original |

#### Animación glitch (opcional para splash)

```css
/* Efecto glitch en hover o en splash screen */
@keyframes glitch {
  0%   { clip-path: inset(0 0 95% 0); transform: translateX(-4px); }
  20%  { clip-path: inset(30% 0 50% 0); transform: translateX(4px); }
  40%  { clip-path: inset(60% 0 20% 0); transform: translateX(-2px); }
  60%  { clip-path: inset(80% 0 5% 0); transform: translateX(2px); }
  80%  { clip-path: inset(10% 0 80% 0); transform: translateX(-4px); }
  100% { clip-path: inset(0 0 95% 0); transform: translateX(0); }
}

.logo-glitch::before,
.logo-glitch::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/images/logo/dark-flix.png') no-repeat center / contain;
}

.logo-glitch::before {
  animation: glitch 3s infinite;
  mix-blend-mode: screen;
  filter: hue-rotate(180deg);   /* canal azul */
  opacity: 0.6;
}

.logo-glitch::after {
  animation: glitch 3s infinite reverse;
  mix-blend-mode: screen;
  filter: hue-rotate(0deg);     /* canal rojo */
  opacity: 0.4;
}
```

---

### 12.1 Pantalla — Home

```
┌─────────────────────────────────────────┐
│  DARKFLIX              🔍  ☰            │  ← Navbar fija, bg #0a0a0a/80 blur
├─────────────────────────────────────────┤
│                                         │
│  [HERO BANNER — backdrop full width]    │  ← imagen backdrop con gradient bottom
│                                         │
│  ┌──────────┐                           │
│  │NEW RELEASE│ 2024  2h 15m             │  ← badges pill rojo / gris oscuro
│  └──────────┘                           │
│                                         │
│  NEON                                   │  ← título H1, blanco, bold, 48px+
│  ECLIPSE                                │
│                                         │
│  Descripción corta de la película...    │  ← 2 líneas max, color #b3b3b3
│                                         │
│  [▶ PLAY NOW]   [MORE INFO]             │  ← botón rojo sólido + botón outline
│                                         │
├─────────────────────────────────────────┤
│  TRENDING NOW                  VER TODO │  ← sección label + link derecha
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │poster│ │poster│ │poster│ │poster│  │  ← cards 2x3 grid en mobile
│  │      │ │      │ │      │ │      │  │     scroll horizontal en desktop
│  │título│ │título│ │título│ │título│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
├─────────────────────────────────────────┤
│  ANIME ORIGINALS               VER TODO │
│  ┌──────────────────────────────────┐  │  ← card destacada ancha (featured)
│  │  CYBERPUNK EDGERUNNERS           │  │
│  │  descripción corta...            │  │
│  │  [▶ WATCH NOW]                   │  │
│  └──────────────────────────────────┘  │
│  ┌──────┐ ┌──────┐                     │
│  │poster│ │poster│                     │
│  └──────┘ └──────┘                     │
├─────────────────────────────────────────┤
│  ACTION THRILLERS              VER TODO │
│  ← [poster] [poster] [poster] →        │  ← flechas de navegación
├─────────────────────────────────────────┤
│  🏠 HOME   🎬 SERIES   🎌 ANIME   ⬇ DL │  ← Bottom nav (mobile only)
└─────────────────────────────────────────┘
```

#### Especificaciones Home

| Elemento | Valor |
|---|---|
| Hero height | `100vh` en desktop, `70vh` en mobile |
| Hero gradient | `linear-gradient(to bottom, transparent 40%, #0a0a0a 100%)` |
| Badge NEW RELEASE | bg `#e50914`, text white, `px-2 py-0.5 text-xs font-bold uppercase` |
| Badge año/duración | bg `#1a1a1a`, border `#2a2a2a`, text `#b3b3b3` |
| Botón PLAY NOW | bg `#e50914`, hover `#f40612`, text white, `px-6 py-3 font-bold` |
| Botón MORE INFO | bg `rgba(255,255,255,0.15)`, hover `rgba(255,255,255,0.25)`, backdrop-blur |
| Card poster ratio | `2/3` (portrait) |
| Card hover | `scale(1.05)` + overlay oscuro + ícono play centrado |
| Sección label | text white, `text-lg font-semibold tracking-wide` |
| VER TODO link | text `#e50914`, `text-sm` |
| Bottom nav bg | `#0a0a0a`, border-top `#2a2a2a` |

---

### 12.2 Pantalla — Detail

```
┌─────────────────────────────────────────┐
│  ← DARKFLIX              🔍  ☰          │  ← back arrow + navbar
├─────────────────────────────────────────┤
│                                         │
│  [BACKDROP FULL WIDTH con gradient]     │
│                                         │
│  ┌────┐ ┌────┐ ┌────┐                  │
│  │NEW │ │2024│ │2h15│                  │  ← badges info
│  └────┘ └────┘ └────┘                  │
│                                         │
│  GHOST IN THE SHELL                     │  ← H1 blanco bold
│                                         │
│  ⭐ 8.0  CYBERPUNK  ACTION              │  ← rating + genre tags
│                                         │
│  [▶ PLAY NOW]                           │  ← botón rojo full-width mobile
│                                         │
│  [480p] [720p] [1080p●] [4K]           │  ← selector calidad, activo=rojo
│                                         │
│  [+]  [⬆]                              │  ← agregar lista + compartir
│                                         │
├─────────────────────────────────────────┤
│  — SYNOPSIS                             │  ← divider rojo + label
│                                         │
│  In the year 2029, the barriers of our  │
│  world have been broken down by the     │
│  net and by cybernetics...              │
│                                         │
├─────────────────────────────────────────┤
│  DIRECTOR          CAST                 │
│  Mamoru Oshii      Atsuko Tanaka,       │
│                    Akio Otsuka          │
│                                         │
│  STUDIO            REVIEW              │
│  Production I.G    Japan               │
├─────────────────────────────────────────┤
│  CREDITS                                │
│  Screenplay    Kazunori Itō             │
│  Producer      Mitsuhisa Ishikawa       │
│  Composer      Kenji Kawai              │
├─────────────────────────────────────────┤
│  ┌──────────────────┐                  │
│  │  IMDB RATING     │                  │  ← card con borde #2a2a2a
│  │  8.0 /10  🏆     │                  │
│  └──────────────────┘                  │
├─────────────────────────────────────────┤
│  — SIMILAR TITLES          VER TODO →  │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │poster│ │poster│ │poster│           │
│  │título│ │título│ │título│           │
│  └──────┘ └──────┘ └──────┘           │
└─────────────────────────────────────────┘
```

#### Especificaciones Detail

| Elemento | Valor |
|---|---|
| Backdrop height | `45vh` con `object-fit: cover` |
| Backdrop gradient | `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, #0a0a0a 85%)` |
| Título H1 | `text-3xl font-black tracking-tight text-white` |
| Rating ⭐ | color `#f5c518` (IMDB yellow), `text-sm font-bold` |
| Genre tags | bg `#1a1a1a`, border `#2a2a2a`, `text-xs uppercase tracking-widest` |
| Quality selector | botones pill, inactivo: bg `#1a1a1a` border `#2a2a2a`, activo: bg `#e50914` |
| Divider sección | `border-l-2 border-[#e50914] pl-3 text-white font-semibold` |
| Ficha técnica label | `text-xs text-[#666] uppercase tracking-wider` |
| Ficha técnica valor | `text-sm text-white` |
| IMDB card | bg `#1a1a1a`, border `#2a2a2a`, `rounded-lg p-4` |

---

### 12.3 Pantalla — Player

```
┌─────────────────────────────────────────┐
│  ←    CYBER ODYSSEY: 2099    📡  ℹ️     │  ← top bar, bg gradient top
│       S1 : E4 • THE NEON GHOST          │
│                                         │
│                                         │
│         [imagen/video fullscreen]       │
│                                         │
│                                         │
│         ↺10   [▶]   10↻                │  ← controles centrados
│                                         │
│                                         │
│                                         │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░   │  ← progress bar roja
│  12:45 / 48:00   🔊 ──────             │  ← tiempo + volumen
│                                         │
│  [CC] SUBTITLES  [⏱] 1.0X  [⚙] [4K] [⛶]│  ← bottom controls
└─────────────────────────────────────────┘
```

#### Especificaciones Player

| Elemento | Valor |
|---|---|
| Fondo | `#000000` puro |
| Top bar bg | `linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)` |
| Bottom bar bg | `linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)` |
| Título | `text-lg font-bold text-white` |
| Subtítulo episodio | `text-xs text-[#b3b3b3] tracking-widest uppercase` |
| Botón play central | bg `#e50914`, `w-16 h-16 rounded-none` (cuadrado), ícono blanco |
| Skip ±10s | ícono circular outline, `text-white/70`, hover `text-white` |
| Progress bar track | bg `rgba(255,255,255,0.3)` |
| Progress bar fill | bg `#e50914` |
| Progress thumb | círculo `#e50914`, `w-3 h-3` |
| Tiempo | `text-sm text-white font-mono` |
| Controles bottom | `text-xs text-white/80 uppercase tracking-wide` |
| Auto-hide controls | ocultar tras 3s de inactividad, mostrar en hover/tap |
| Iconos cast/info | `text-white/80`, `w-6 h-6` |

---

### 12.4 Componente — MediaCard

```
┌────────────────┐
│                │  ← poster 2/3 ratio
│   [POSTER]     │     object-fit: cover
│                │     border-radius: 4px
│                │
│  ┌──────────┐  │  ← overlay en hover
│  │    ▶     │  │     bg rgba(0,0,0,0.6)
│  │  TÍTULO  │  │     play icon centrado
│  │  año·cal │  │
│  └──────────┘  │
└────────────────┘
```

```typescript
// Animación hover (TailwindCSS)
// group-hover:scale-105 transition-transform duration-200
// group-hover:ring-2 group-hover:ring-[#e50914]
```

---

### 12.5 Navbar

```
┌─────────────────────────────────────────────────────────┐
│  DARKFLIX   Inicio  Películas  Series  Anime    🔍  👤  │  ← desktop
└─────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│  DARKFLIX          🔍 ☰ │  ← mobile (hamburger)
└─────────────────────────┘
```

| Elemento | Valor |
|---|---|
| bg | `rgba(10,10,10,0.95)` + `backdrop-blur-md` |
| height | `64px` desktop / `56px` mobile |
| Logo color | `#ffffff` con acento `#e50914` |
| Nav links | `text-sm text-[#b3b3b3]` hover `text-white`, activo `text-white font-semibold` |
| Posición | `fixed top-0 z-50 w-full` |
| Scroll behavior | bg se vuelve opaco al hacer scroll > 50px |

---

### 12.6 Bottom Navigation (mobile)

```
┌──────────────────────────────────────┐
│  🏠      🎬       🎌       ⬇        │
│ HOME   SERIES   ANIME   DESCARGAS   │
└──────────────────────────────────────┘
```

| Elemento | Valor |
|---|---|
| bg | `#0a0a0a` |
| border-top | `1px solid #2a2a2a` |
| height | `60px` |
| ícono activo | color `#e50914` |
| ícono inactivo | color `#666666` |
| label | `text-[10px]` |

---

### 12.7 Tipografía

| Uso | Font | Size | Weight |
|---|---|---|---|
| Logo | Inter / Bebas Neue | 28px | 900 |
| Hero título | Inter | 48px+ | 800 |
| H1 detail | Inter | 30px | 900 |
| Body / sinopsis | Inter | 14px | 400 |
| Labels / badges | Inter | 11px | 600 |
| Tiempo player | JetBrains Mono | 13px | 400 |
| Nav links | Inter | 14px | 400/600 |

```html
<!-- index.html — Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Bebas+Neue&display=swap" rel="stylesheet">
```

---

### 12.8 Animaciones y transiciones

| Interacción | Animación |
|---|---|
| Card hover | `scale(1.05)` 200ms ease |
| Card overlay | `opacity: 0 → 1` 150ms |
| Botón hover | `brightness(1.1)` 150ms |
| Route transition | `View Transitions API` (Angular `withViewTransitions()`) |
| Skeleton loader | pulse `opacity 0.5 → 1` 1.5s infinite |
| Hero banner | fade-in desde abajo 600ms al cargar |
| Player controls | fade-out 300ms tras 3s inactividad |
| Modal | scale `0.95 → 1` + fade 200ms |

---

### 12.9 Responsive breakpoints

```
mobile:   < 640px   → 2 columnas en grid, bottom nav, hero 70vh
tablet:   640-1024px → 3 columnas, navbar top, hero 80vh
desktop:  > 1024px  → 4-5 columnas, navbar top, hero 100vh
```

```javascript
// tailwind.config.js — breakpoints custom
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
}
```

---

### 12.10 Paleta completa

```
Fondos
  #0a0a0a  — fondo principal (negro profundo)
  #141414  — fondo secundario / cards
  #1a1a1a  — superficie elevada
  #2a2a2a  — bordes / separadores

Acento
  #e50914  — rojo primario (botones, progress, activos)
  #f40612  — rojo hover
  #b00710  — rojo pressed

Texto
  #ffffff  — texto primario
  #b3b3b3  — texto secundario / muted
  #666666  — texto deshabilitado / labels

Especiales
  #f5c518  — IMDB yellow (rating)
  #00d4aa  — verde para badges "HD" premium (opcional)
```

---

*Diseño documentado a partir de mockups DarkFlix — Marzo 2026*

---

## 14. MCPs recomendados para Kiro

Los MCPs (Model Context Protocol) permiten a Kiro interactuar con herramientas externas directamente desde el chat. Para DarkFlix estos son los más útiles:

### MCP instalado actualmente

```json
// .vscode/mcp.json
{
  "servers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

El MCP de Angular CLI ya está activo. Con él puedes pedirle a Kiro directamente:
- "genera un componente media-card en shared/components"
- "crea el servicio movies en core/api"
- "agrega una ruta lazy para el módulo catalog"
- "muéstrame los proyectos Angular en este workspace"

---

### MCPs adicionales recomendados para este proyecto

Agregar en `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {

    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"],
      "disabled": false
    },

    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src"],
      "disabled": false,
      "autoApprove": ["read_file", "list_directory"]
    },

    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"],
      "disabled": false,
      "autoApprove": ["fetch"]
    },

    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "TU_API_KEY"
      },
      "disabled": false
    }

  }
}
```

### Para qué sirve cada uno en DarkFlix

| MCP | Uso concreto en DarkFlix |
|---|---|
| `angular-cli` | Generar componentes, servicios, guards, pipes con `ng generate` desde Kiro |
| `filesystem` | Kiro puede leer/listar archivos del `src/` para entender el contexto antes de editar |
| `fetch` | Probar endpoints de hackstore.mx directamente desde Kiro: "trae los primeros 5 posts de `/wp-json/wp/v2/pelicula`" |
| `brave-search` | Buscar documentación de Angular 21, TailwindCSS, hls.js sin salir del IDE |

### Flujos de trabajo con MCPs activos

```
# Generar feature completa
"Kiro, genera el componente catalog con su store y rutas lazy"
→ angular-cli MCP ejecuta ng generate automáticamente

# Explorar la API en vivo
"Kiro, consulta https://hackstore.mx/wp-json/wp/v2/types y dime
 qué custom post types están disponibles"
→ fetch MCP hace el request y Kiro analiza la respuesta

# Buscar solución a un problema
"Kiro, busca cómo usar CdkVirtualScrollViewport con signals en Angular 21"
→ brave-search MCP trae resultados actualizados

# Entender el código existente
"Kiro, revisa todos los archivos en src/app/features/catalog y
 dime si el store está bien conectado al componente"
→ filesystem MCP lee los archivos y Kiro analiza
```

### Cómo instalar un MCP en Kiro

1. Abrir paleta de comandos: `Ctrl+Shift+P` → buscar `MCP`
2. O editar directamente `.kiro/settings/mcp.json`
3. Los servidores se reconectan automáticamente al guardar el archivo
4. Verificar en el panel de Kiro → sección "MCP Servers"

> Nota: Los servidores que usan `npx` no requieren instalación previa.
> `uvx` requiere tener instalado `uv` (Python package manager).
> Ver: https://docs.astral.sh/uv/getting-started/installation/

---

*Arquitectura actualizada — Marzo 2026*

---

## 15. Convenciones Angular 21 (actualizadas)

### Naming de archivos — sin sufijo de tipo

El CLI de Angular 20+ eliminó el sufijo de tipo en los nombres de archivo.
La clase sigue teniendo el sufijo, pero el archivo no.

```
ng generate service   movies        →  movies.ts           (clase: MoviesService)
ng generate component media-card    →  media-card.ts       (clase: MediaCardComponent)
ng generate pipe      duration      →  duration.ts         (clase: DurationPipe)
ng generate guard     auth          →  auth.ts             (clase: AuthGuard / authGuard fn)
ng generate directive lazy-image    →  lazy-image.ts       (clase: LazyImageDirective)
ng generate interceptor cache       →  cache-interceptor.ts (clase: cacheInterceptor fn)
```

### standalone: true — ya no se escribe

En Angular 20+ todos los componentes son standalone por defecto.
NO escribir `standalone: true` en el decorador.

```typescript
// ❌ Angular 17-19
@Component({ standalone: true, selector: 'df-card', ... })

// ✅ Angular 20+
@Component({ selector: 'df-card', changeDetection: ChangeDetectionStrategy.OnPush, ... })
```

### provideZonelessChangeDetection — nombre estable

En Angular 21 la función ya no tiene el prefijo `Experimental`.

```typescript
// ❌ Antes (Angular 18-20)
provideExperimentalZonelessChangeDetection()

// ✅ Angular 21
provideZonelessChangeDetection()
```

### Path aliases — imports limpios

Configurados en `tsconfig.json` + `vitest.config.ts`:

```typescript
// ❌ Rutas relativas largas
import { WpPost } from '../../../core/models';
import { MoviesService } from '../../api/movies';

// ✅ Aliases
import type { WpPost } from '@models';
import { MoviesService } from '@api/movies';
import { environment } from '@env';
import { ProgressBarService } from '@services/progress-bar';
import { cacheInterceptor } from '@interceptors/cache-interceptor';
```

| Alias | Apunta a |
|---|---|
| `@models` | `src/app/core/models/index.ts` |
| `@api/*` | `src/app/core/api/*` |
| `@services/*` | `src/app/core/services/*` |
| `@interceptors/*` | `src/app/core/interceptors/*` |
| `@shared/*` | `src/app/shared/*` |
| `@features/*` | `src/app/features/*` |
| `@core/*` | `src/app/core/*` |
| `@env` | `src/environments/environment.ts` |

### ChangeDetectionStrategy.OnPush — siempre

Todos los componentes deben tener `OnPush`. Con zoneless + signals es obligatorio.

```typescript
@Component({
  selector: 'df-media-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
```

### Tailwind v4 — sintaxis actualizada

```
// ❌ Tailwind v3
z-[9999]           →  z-9999
bg-gradient-to-l   →  bg-linear-to-l
bg-gradient-to-r   →  bg-linear-to-r
```
