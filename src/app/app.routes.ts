import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    // MCP Best Practice: Implement lazy loading for feature routes
    loadComponent: () => import('./features/browse/browse-home').then(m => m.BrowseHomeComponent),
    title: 'DarkFlix | Inicio'
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search-view').then(m => m.SearchViewComponent),
    title: 'DarkFlix | Búsqueda'
  },
  {
    path: ':typeSlug/:slug',
    loadComponent: () => import('./features/movie/movie-details').then(m => m.MovieDetailsComponent),
    title: 'DarkFlix | Detalles'
  },
  {
    path: '**',
    redirectTo: '' // Fallback route
  }
];
