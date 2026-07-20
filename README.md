# 🎬 DarkFlix

> Plataforma de streaming tipo Netflix para películas, series y animes, construida como **SPA headless** sobre Angular 22, consumiendo directamente la API REST de WordPress de [hackstore.mx](https://hackstore.mx).

![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

🔗 **Demo en vivo:** [https://darkflix.dpdns.org/](https://darkflix.dpdns.org/)

---

## ✨ ¿Qué es DarkFlix?

DarkFlix es una aplicación web tipo Netflix que consume el catálogo de contenido (películas, series y animes) de un backend WordPress ya existente. **No tiene backend propio**: toda la información de medios, temporadas, episodios, reparto y descargas se obtiene en tiempo real desde la API REST de WordPress.

El foco del proyecto está en el frontend: una experiencia cinematográfica, rápida, instalable como PWA y con estado reactivo puro basado en Signals.

---

## 🚀 Funcionalidades destacadas

- 🏠 **Home cinematográfica** — Hero banner con post destacado aleatorio + carruseles segmentados (Vistos recientemente, Películas, Series, Animes).
- 👤 **Sistema de perfiles** — Hasta 4 perfiles personalizables (icono + color) con datos aislados por usuario en `localStorage`.
- 🔍 **Búsqueda global** — Con `debounceTime` y búsqueda contra `/search?postType=any`.
- 📚 **Catálogo filtrable** — Filtros combinables por género, país y año con paginación infinita.
- 🎬 **Detalles de película / serie** — Backdrop con desenfoque cinematográfico, reparto, relacionados, reproductores y descargas.
- 📺 **Series y animes** — Selector de temporadas, lista de episodios con progreso individual y función **"Continuar viendo"**.
- ✅ **Mi lista** — Favoritos persistentes por perfil.
- ⏱️ **Progreso de episodios** — Guarda posición, marca como visto al 90% y permite reanudar.
- 🌐 **Offline-first PWA** — Service Worker con `@angular/service-worker`, manifest instalable y banner de "sin conexión".
- ⚡ **Performance** — Zoneless change detection, `OnPush`, `viewTransitions`, preloading de rutas, lazy loading de imágenes, interceptor de caché HTTP y barra de progreso global.
- 📱 **Responsive** — Bottom nav en móvil, top nav en desktop, splash screen y skeletons.

---

## 🧰 Stack tecnológico

| Capa            | Tecnología                                                   |
| --------------- | ------------------------------------------------------------ |
| Framework       | **Angular 22** (standalone components, signals, zoneless)    |
| Lenguaje        | **TypeScript 6** con modo estricto                           |
| Estilos         | **TailwindCSS 4** + PostCSS (sin CSS por componente)         |
| Estado reactivo | **Signals + RxJS** (`signal`, `computed`, `effect`, `toSignal`) |
| Routing         | `@angular/router` con `loadComponent`, `viewTransitions` y preloading |
| HTTP            | `HttpClient` + `withFetch` + interceptors (caché + progreso) |
| PWA             | `@angular/service-worker` + `ngsw-config.json` + manifest    |
| Testing         | **Vitest** + jsdom + fast-check                               |
| Package manager | **npm**                                                       |

> Sin NgModules, sin `Zone.js`, sin librerías de UI externas. El sistema de diseño vive 100% en Tailwind.

---

## 🏗️ Arquitectura

Estructura de carpetas (resumen):

```
src/app/
├── core/                   # Lógica transversal (servicios, modelos, guards, interceptors)
│   ├── api/                # Tipos y helpers de la API
│   ├── guards/             # profileGuard (obliga a tener perfil activo)
│   ├── interceptors/       # cache-interceptor, progress-interceptor
│   ├── models/             # ApiMedia, EpisodeProgress, profile-icons, etc.
│   └── services/           # WpMediaService, ProfileService, MyListService,
│                           # WatchHistoryService, EpisodeProgressService, etc.
├── features/               # Vistas (lazy-loaded)
│   ├── browse/             # Home
│   ├── profiles/           # Selección / gestión de perfiles
│   ├── search/             # Búsqueda
│   ├── my-list/            # Favoritos
│   ├── catalog/            # Catálogo con filtros
│   └── movie/              # Detalle de película/serie/anime
├── shared/                 # Componentes, directivas y pipes reutilizables
│   ├── components/         # hero-banner, media-slider, media-grid, top/bottom-nav, etc.
│   ├── directives/         # lazy-image, iframe-loader
│   └── pipes/              # wp-image, media-url, safe
├── app.routes.ts           # Rutas con loadComponent y guards
├── app.config.ts           # Providers (zoneless, router, http, SW)
└── app.ts                  # Shell con splash, banners y nav global
```

### Diagrama de flujo

```
┌──────────────┐    navigate     ┌────────────────┐    HTTP     ┌─────────────────┐
│   Browser    │ ──────────────▶ │  Angular SPA   │ ──────────▶ │  WP REST API    │
│  (PWA shell) │ ◀────────────── │  (DarkFlix)    │ ◀────────── │  hackstore.mx   │
└──────────────┘    UI update    └────────────────┘   JSON      └─────────────────┘
                                       │
                                       │ signals + localStorage
                                       ▼
                              ┌────────────────┐
                              │  Estado local  │
                              │  • profiles    │
                              │  • my-list     │
                              │  • watch hist. │
                              │  • episodes    │
                              └────────────────┘
```

### Decisiones técnicas relevantes

- **Zoneless + Signals** — Renderizado predictivo y menos overhead. Todos los componentes usan `ChangeDetectionStrategy.OnPush` y exponen estado vía `signal()`.
- **API como contrato** — `WpMediaService` centraliza todas las llamadas HTTP; los componentes no conocen URLs ni headers.
- **Estado por perfil** — Las claves de `localStorage` se prefijan con el `profileId`, así cada perfil tiene su propia lista, historial y progreso.
- **Interceptores** — `cacheInterceptor` evita re-disparar la barra de progreso cuando la respuesta viene de caché; `progressInterceptor` la activa en el resto de peticiones.
- **Carga progresiva** — `preloadAllModules`, `viewTransitions`, `LazyImageDirective` y skeletons para que la navegación se sienta fluida.

---

## 🖥️ Ejecutar en local

### Requisitos

- **Node.js** ≥ 20
- **npm** ≥ 10

### Pasos

```bash
# 1. Clonar
git clone https://github.com/JoseVale99/dark-flix.git
cd dark-flix

# 2. Instalar dependencias
npm install

# 3. Levantar el dev server (puerto 4200 por defecto)
npm start

# 4. Build de producción
npm run build
```

La app quedará disponible en `http://localhost:4200/`.

> ℹ️ En desarrollo se usa `proxy.conf.json` para evitar CORS contra `hackstore.mx`. En producción se consume directamente desde la URL pública.

---

## 🧪 Tests

```bash
# Suite completa con Vitest (modo headless)
npm test
```

Los tests cubren unidades críticas: `EpisodeProgressService`, `WpMediaService`, `ProfileService` y el `BrowseHomeComponent`.

---

## 📦 Deploy

El proyecto está preparado para desplegarse como SPA estática:

```bash
npm run build
# El output queda en dist/dark-flix/browser/
```

El hosting actual ([darkflix.dpdns.org](https://darkflix.dpdns.org/)) lo sirve como sitio estático con HTTPS y dominio personalizado. También incluye `vercel.json` para desplegar directamente en Vercel si se desea.

---

## 📸 Capturas

> *Próximamente: agregar capturas de Home, Detalle, Perfiles y Reproductor.*

---

## 📝 Notas legales

Este proyecto es un **trabajo de portafolio / frontend experimental** que consume la API pública de un sitio de terceros (`hackstore.mx`). No aloja, distribuye ni almacena contenido multimedia. Todos los derechos sobre películas, series y animes mostrados pertenecen a sus respectivos titulares.

---

## 👤 Autor

**José Valentín Zarate** — [@JoseVale99](https://github.com/JoseVale99)

Hecho con ❤️ y mucho café como proyecto personal para demostrar arquitectura frontend moderna con Angular.
