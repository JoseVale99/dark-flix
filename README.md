<div align="center">

<!-- Banner -->
<img src="https://raw.githubusercontent.com/JoseVale99/dark-flix/main/public/images/logo/dark-flix.png" alt="DarkFlix" width="280"/>

# 🎬 DarkFlix

### Plataforma de streaming tipo Netflix construida como SPA headless sobre Angular 22.

Consume la API REST de WordPress de [`hackstore.mx`](https://hackstore.mx) para ofrecer una experiencia cinematográfica de **películas, series y animes** con perfiles múltiples, progreso de episodios, búsqueda, filtros y soporte PWA offline-first.

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Demo-darkflix.dpdns.org-E50914?style=for-the-badge)](https://darkflix.dpdns.org/)
[![Stars](https://img.shields.io/github/stars/JoseVale99/dark-flix?style=for-the-badge&logo=github&color=yellow)](https://github.com/JoseVale99/dark-flix/stargazers)
[![Forks](https://img.shields.io/github/forks/JoseVale99/dark-flix?style=for-the-badge&logo=github&color=blue)](https://github.com/JoseVale99/dark-flix/forks)
[![Issues](https://img.shields.io/github/issues/JoseVale99/dark-flix?style=for-the-badge&logo=github&color=red)](https://github.com/JoseVale99/dark-flix/issues)
[![License](https://img.shields.io/github/license/JoseVale99/dark-flix?style=for-the-badge&color=green)](./LICENSE)

<br/>

![Angular](https://img.shields.io/badge/Angular-22-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=flat-square&logo=reactivex&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Node](https://img.shields.io/badge/Node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-%E2%89%A510-CB3837?style=flat-square&logo=npm&logoColor=white)

<br/>

[🌐 Demo](https://darkflix.dpdns.org/) · [📖 Documentación](./ARCHITECTURE.md) · [🐛 Reportar bug](https://github.com/JoseVale99/dark-flix/issues/new) · [✨ Solicitar feature](https://github.com/JoseVale99/dark-flix/issues/new)

</div>

---

## 📑 Tabla de contenidos

- [✨ Características](#-características)
- [🏗️ Arquitectura](#️-arquitectura)
- [🧰 Stack tecnológico](#-stack-tecnológico)
- [🚀 Inicio rápido](#-inicio-rápido)
- [⚙️ Configuración](#️-configuración)
- [📜 Scripts disponibles](#-scripts-disponibles)
- [📂 Estructura del proyecto](#-estructura-del-proyecto)
- [🧪 Testing](#-testing)
- [📦 Despliegue](#-despliegue)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)
- [⚠️ Aviso legal](#️-aviso-legal)
- [👤 Autor](#-autor)
- [⭐ Soporta el proyecto](#-soporta-el-proyecto)

---

## ✨ Características

> DarkFlix está diseñado para ofrecer una experiencia cinematográfica de primer nivel sobre una arquitectura frontend moderna, reactiva y de alto rendimiento.

### 🎥 Experiencia de usuario

| Feature                                  | Descripción                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 🏠 **Home cinematográfica**              | Hero banner con post destacado + carruseles segmentados (Vistos recientemente, Películas, Series, Animes).                         |
| 👤 **Perfiles múltiples**                | Hasta 4 perfiles personalizables con ícono y color. Cada perfil tiene su propia lista, historial y progreso.                        |
| 🔍 **Búsqueda global**                   | Búsqueda contra `/search?postType=any` con `debounceTime` para evitar peticiones innecesarias.                                       |
| 🎛️ **Catálogo filtrable**                | Filtros combinables por **género**, **país** y **año**, con paginación infinita.                                                    |
| 🎬 **Detalle cinematográfico**           | Backdrop con desenfoque, máscaras, reparto, relacionados, reproductores y enlaces de descarga.                                      |
| 📺 **Series y animes**                   | Selector de temporadas, lista de episodios con progreso individual, función **"Continuar viendo"**.                                 |
| ❤️ **Mi Lista**                          | Favoritos persistentes por perfil, sincronizados con `localStorage`.                                                                 |
| ⏱️ **Progreso de episodios**             | Guarda posición, marca como visto al 90 % del tiempo total y reanuda exactamente donde lo dejaste.                                  |
| 📥 **Descargas**                         | Listado de mirrors de descarga por película desde la API.                                                                            |
| 🌐 **Offline-first**                     | Banner de "Sin conexión" y Service Worker para servir contenido cacheado.                                                            |
| 📱 **PWA instalable**                    | `manifest.webmanifest` + `ngsw-config.json` permiten instalación en escritorio y móvil.                                              |
| 🎨 **Diseño responsive**                 | Bottom nav móvil, top nav desktop, splash screen, skeletons y transiciones nativas (`viewTransitions`).                            |

### ⚡ Ingeniería y performance

- 🧬 **Zoneless change detection** — sin `Zone.js`, renderizado predictivo basado en `Signals`.
- 📦 **Standalone components** — sin `NgModules`, todo árbol de imports explícito.
- 🪝 **Signals + RxJS** — estado reactivo con `signal`, `computed`, `effect` y `toSignal`.
- 🚀 **Lazy loading de rutas** — cada feature se carga bajo demanda con `loadComponent`.
- 🖼️ **Lazy images** — directiva propia `LazyImageDirective` con `IntersectionObserver`.
- 🧠 **Caché HTTP** — interceptor que evita disparar la barra de progreso cuando la respuesta viene de caché.
- 📊 **Barra de progreso global** — `progressInterceptor` + `ProgressBarService` para peticiones y navegación.
- 🧹 **Skeletons** — estados de carga coherentes con el layout final (sin "saltos" visuales).
- 🧪 **Testing** — Vitest + jsdom + fast-check sobre las piezas críticas (servicios y componentes clave).

---

## 🏗️ Arquitectura

DarkFlix es una **SPA headless**: no tiene backend propio. El frontend consume directamente la API REST de WordPress de `hackstore.mx` y persiste todo el estado local del usuario en `localStorage` (prefijado por `profileId`).

```
                         ┌─────────────────────────────────────┐
                         │           Browser / PWA             │
                         │  (Service Worker · Manifest · UI)   │
                         └────────────────┬────────────────────┘
                                          │
                              Signals + RxJS + localStorage
                                          │
                         ┌────────────────▼────────────────────┐
                         │            Angular 22                │
                         │  ┌─────────────┐  ┌──────────────┐   │
                         │  │  Features   │  │    Shared    │   │
                         │  │  (lazy)     │  │  Components  │   │
                         │  └─────┬───────┘  └──────┬───────┘   │
                         │        │                │            │
                         │  ┌─────▼────────────────▼───────┐    │
                         │  │           Core               │    │
                         │  │  · Services (Signals)         │    │
                         │  │  · Interceptors (cache/progress)│  │
                         │  │  · Guards (profileGuard)      │    │
                         │  └─────────────┬─────────────────┘    │
                         └────────────────┼──────────────────────┘
                                          │  HTTP / fetch
                         ┌────────────────▼────────────────────┐
                         │      WordPress REST API            │
                         │       (hackstore.mx)               │
                         └─────────────────────────────────────┘
```

### Decisiones de diseño clave

- 🧩 **Core / Features / Shared** — Separación clara entre lógica transversal, vistas de producto y UI reutilizable.
- 🛣️ **Routing declarativo** — `app.routes.ts` con `loadComponent` y `canActivate: [profileGuard]` para bloquear rutas sin perfil.
- 🧠 **Estado por perfil** — Cada servicio (`MyListService`, `WatchHistoryService`, `EpisodeProgressService`) segmenta su `localStorage` por `profileId`.
- 🛰️ **Capa API única** — `WpMediaService` centraliza URLs, query params y mapeos; los componentes nunca tocan `HttpClient` directamente.
- 🔁 **Interceptores en cascada** — `cacheInterceptor` se ejecuta antes que `progressInterceptor` para no mostrar progreso en respuestas cacheadas.
- 🖼️ **Smart vs Dumb** — Componentes smart consumen servicios; los dumb (`MediaCard`, `MediaSlider`, `HeroBanner`) reciben inputs y emiten eventos.

---

## 🧰 Stack tecnológico

| Capa                  | Tecnología                                                              |
| --------------------- | ----------------------------------------------------------------------- |
| 🎯 **Framework**      | [Angular 22](https://angular.dev) — standalone, zoneless, signals        |
| 🟦 **Lenguaje**       | [TypeScript 6](https://www.typescriptlang.org/) en modo estricto         |
| 🎨 **Estilos**        | [TailwindCSS 4](https://tailwindcss.com/) + PostCSS (sin SCSS ni CSS por componente) |
| 🔄 **Reactividad**    | Signals + [RxJS 7.8](https://rxjs.dev/)                                  |
| 🛣️ **Routing**        | `@angular/router` con `loadComponent`, `viewTransitions`, `preloadAllModules` |
| 🌐 **HTTP**           | `HttpClient` + `withFetch` + interceptors funcionales                    |
| 📲 **PWA**            | `@angular/service-worker` + `ngsw-config.json` + `manifest.webmanifest` |
| 🧪 **Testing**        | [Vitest](https://vitest.dev/) + jsdom + [fast-check](https://fast-check.dev/) |
| 📦 **Build**          | `@angular/build:application` (esbuild)                                  |
| 🧰 **Package manager**| npm 10                                                                   |

> 🚫 Sin librerías de UI externas (Material, PrimeNG, Bootstrap). El design system vive 100 % en Tailwind.

---

## 🚀 Inicio rápido

### Prerrequisitos

Asegúrate de tener instalado:

- **Node.js** ≥ 20
- **npm** ≥ 10

```bash
node --version   # v20.x o superior
npm --version    # 10.x o superior
```

### Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/JoseVale99/dark-flix.git

# 2. Entra al directorio
cd dark-flix

# 3. Instala las dependencias
npm install

# 4. Inicia el servidor de desarrollo
npm start
```

La aplicación quedará disponible en 👉 **http://localhost:4200/**

> 💡 El proyecto incluye `proxy.conf.json` para evitar CORS durante el desarrollo. En producción se consume la API directamente.

---

## ⚙️ Configuración

### Entornos

DarkFlix utiliza los [file replacements](https://angular.dev/tools/cli/environments) estándar de Angular.

| Archivo                                       | Uso                                |
| --------------------------------------------- | ---------------------------------- |
| `src/environments/environment.ts`             | Producción (build default)         |
| `src/environments/environment.development.ts` | Desarrollo local (`npm start`)      |

```ts
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiBaseUrl: '/wp-api/v1',   // vía proxy
};
```

```ts
// src/environments/environment.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://hackstore.mx/wp-api/v1',
};
```

### Proxy de desarrollo

`proxy.conf.json` redirige las llamadas `/wp-api/*` hacia la API externa:

```json
{
  "/wp-api/*": {
    "target": "https://hackstore.mx",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

---

## 📜 Scripts disponibles

| Comando           | Descripción                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| `npm start`       | Inicia el dev server en `http://localhost:4200/`                       |
| `npm run build`   | Genera el bundle de producción en `dist/dark-flix/browser/`            |
| `npm run watch`   | Build en modo desarrollo con watch                                     |
| `npm test`        | Ejecuta la suite de tests con Vitest (headless, sin watch)             |

---

## 📂 Estructura del proyecto

```
dark-flix/
├── public/
│   ├── images/                      # Logos, posters y assets estáticos
│   ├── favicon.ico
│   └── manifest.webmanifest         # PWA manifest
├── src/
│   ├── app/
│   │   ├── core/                    # Lógica transversal
│   │   │   ├── api/                 # Tipos y helpers de la API
│   │   │   ├── constants/           # Catálogos de filtros (géneros, países, años)
│   │   │   ├── guards/              # profileGuard
│   │   │   ├── interceptors/        # cacheInterceptor · progressInterceptor
│   │   │   ├── models/              # ApiMedia, EpisodeProgress, profile-icons…
│   │   │   └── services/            # WpMediaService · ProfileService · MyListService
│   │   │                            # WatchHistoryService · EpisodeProgressService
│   │   │                            # NetworkService · ProgressBarService · SearchHistoryService
│   │   ├── features/                # Vistas lazy-loaded
│   │   │   ├── browse/              # 🏠 Home
│   │   │   ├── profiles/            # 👤 Selección y gestión de perfiles
│   │   │   ├── search/              # 🔍 Búsqueda
│   │   │   ├── my-list/             # ❤️ Mi lista
│   │   │   ├── catalog/             # 🎛️ Catálogo con filtros
│   │   │   └── movie/               # 🎬 Detalle (películas / series / animes)
│   │   ├── shared/                  # UI reutilizable
│   │   │   ├── components/          # hero-banner · media-slider · media-grid
│   │   │   │                        # media-card · top-nav · bottom-nav · badge
│   │   │   │                        # progress-bar · skeleton-card · splash-screen
│   │   │   │                        # pwa-install-banner · filter-dropdown
│   │   │   ├── directives/          # lazy-image · iframe-loader
│   │   │   └── pipes/               # wp-image · media-url · safe
│   │   ├── app.config.ts            # Providers (zoneless, router, http, SW)
│   │   ├── app.routes.ts            # Rutas con loadComponent y guards
│   │   ├── app.ts                   # Shell con splash, banners y nav global
│   │   ├── app.html
│   │   └── app.css
│   ├── environments/                # environment.ts · environment.development.ts
│   ├── index.html
│   ├── main.ts                      # Bootstrap con appConfig
│   ├── styles.css                   # Tailwind + tokens CSS
│   └── test-setup.ts
├── proxy.conf.json                  # Proxy dev para CORS
├── ngsw-config.json                 # Service Worker
├── angular.json
├── vercel.json                      # Config opcional para Vercel
├── vitest.config.ts
├── tsconfig.json · tsconfig.app.json · tsconfig.spec.json
├── ARCHITECTURE.md                  # 📖 Arquitectura detallada
└── package.json
```

---

## 🧪 Testing

```bash
npm test
```

Tests incluidos (Vitest en modo headless):

- ✅ `EpisodeProgressService` — guardado, marcado, progreso por episodio y por serie.
- ✅ `WpMediaService` — mapeo de respuestas y contratos de la API.
- ✅ `ProfileService` — CRUD y persistencia de perfiles.
- ✅ `BrowseHomeComponent` — composición de sliders y navegación.

---

## 📦 Despliegue

```bash
npm run build
# → dist/dark-flix/browser/
```

El build genera una **SPA estática** lista para servir desde cualquier hosting:

- 🌐 **Dominio propio** — Hosteado en [darkflix.dpdns.org](https://darkflix.dpdns.org/).
- ▲ **Vercel** — `vercel.json` incluido para deploy con un click.
- ☁️ **Netlify / GitHub Pages / S3** — Copia el contenido de `dist/dark-flix/browser/` y configura fallback a `index.html`.

> ⚙️ El Service Worker solo se activa en builds de producción (`provideServiceWorker` con `isDevMode()`).

---

## 🗺️ Roadmap

- [x] Catálogo de películas, series y animes
- [x] Sistema de perfiles múltiples
- [x] Progreso de episodios y "Continuar viendo"
- [x] Catálogo con filtros combinables
- [x] Búsqueda global
- [x] PWA instalable + offline
- [ ] 🔐 Backend propio (autenticación real con JWT)
- [ ] 🎞️ Reproductor nativo (HLS / DASH) sin iframes
- [ ] 📡 Sincronización entre dispositivos
- [ ] 🧪 E2E tests con Playwright
- [ ] 🌐 i18n (ES / EN / PT)
- [ ] ♿ Auditoría de accesibilidad (WCAG 2.2 AA)

> 💡 ¿Tienes alguna idea? [Abre un issue](https://github.com/JoseVale99/dark-flix/issues/new) o un PR.

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas y amadas! 💜

1. 🍴 Haz un **fork** del repositorio.
2. 🌿 Crea una rama para tu feature (`git checkout -b feat/mi-feature`).
3. 💾 Haz commit de tus cambios siguiendo [Conventional Commits](https://www.conventionalcommits.org/).
4. 📤 Push a tu fork (`git push origin feat/mi-feature`).
5. 🔀 Abre un **Pull Request** describiendo el cambio.

### Guías

- ✅ Mantén los componentes **standalone** y con `OnPush`.
- ✅ Usa **signals** para todo estado nuevo; evita `BehaviorSubject` salvo que sea estrictamente necesario.
- ✅ Estilos 100 % **Tailwind**; no agregues CSS por componente.
- ✅ Añade o actualiza tests para cualquier lógica no trivial.
- ✅ Corre `npm test` antes de abrir el PR.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

```
MIT License

Copyright (c) 2025 José Valentín Zarate

Se concede permiso, sin cargo alguno, a cualquier persona que obtenga una copia
de este software y archivos de documentación asociados…
```

---

## ⚠️ Aviso legal

> **DarkFlix es un proyecto de portafolio / frontend experimental.**

- 🚫 Este proyecto **no aloja, distribuye ni almacena** contenido multimedia.
- 🎥 Todos los derechos sobre películas, series y animes mostrados pertenecen a sus respectivos titulares.
- 🌐 El contenido se consume desde la API pública de un sitio de terceros ([hackstore.mx](https://hackstore.mx)).
- 🛠️ Si eres titular de derechos y deseas que se retire algún contenido, por favor abre un issue y se atenderá a la brevedad.

---

## 👤 Autor

<div align="center">

**José Valentín Zarate**

Desarrollador frontend · Apasionado por Angular, UX y arquitecturas reactivas.

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-JoseVale99-181717?style=for-the-badge&logo=github)](https://github.com/JoseVale99)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-josevale99-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/josevale99/)
[![Portfolio](https://img.shields.io/badge/Portfolio-darkflix.dpdns.org-E50914?style=for-the-badge&logo=google-chrome&logoColor=white)](https://darkflix.dpdns.org/)

</div>

---

## ⭐ Soporta el proyecto

<div align="center">

Si DarkFlix te resulta útil, inspírate o te ahorra tiempo:

<a href="https://github.com/JoseVale99/dark-flix/stargazers">
  <img src="https://img.shields.io/badge/⭐_Dale_una_estrella-E50914?style=for-the-badge&logoColor=white" alt="Star"/>
</a>
<a href="https://github.com/JoseVale99/dark-flix/fork">
  <img src="https://img.shields.io/badge/🍴_Haz_fork-181717?style=for-the-badge&logoColor=white" alt="Fork"/>
</a>
<a href="https://github.com/JoseVale99/dark-flix/issues/new">
  <img src="https://img.shields.io/badge/🐛_Reporta_un_bug-red?style=for-the-badge&logoColor=white" alt="Bug"/>
</a>

<br/>

<sub>Hecho con ❤️, mucho café y Angular.</sub>

</div>
