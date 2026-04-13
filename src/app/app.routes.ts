import { Routes } from '@angular/router';
import { profileGuard } from '@core/guards/profile.guard';

export const routes: Routes = [
  {
    path: 'profiles',
    loadComponent: () => import('./features/profiles/profiles-view').then(m => m.ProfilesViewComponent),
    title: 'DarkFlix | Perfiles'
  },
  {
    path: '',
    canActivate: [profileGuard],
    loadComponent: () => import('./features/browse/browse-home').then(m => m.BrowseHomeComponent),
    title: 'DarkFlix | Inicio'
  },
  {
    path: 'search',
    canActivate: [profileGuard],
    loadComponent: () => import('./features/search/search-view').then(m => m.SearchViewComponent),
    title: 'DarkFlix | Búsqueda'
  },
  {
    path: 'mi-lista',
    canActivate: [profileGuard],
    loadComponent: () => import('./features/my-list/my-list-view').then(m => m.MyListViewComponent),
    title: 'DarkFlix | Mi Lista'
  },
  {
    path: ':catalogType',
    canActivate: [profileGuard],
    loadComponent: () => import('./features/catalog/catalog-view').then(m => m.CatalogViewComponent),
    title: 'DarkFlix | Catálogo'
  },
  {
    path: ':typeSlug/:slug',
    canActivate: [profileGuard],
    loadComponent: () => import('./features/movie/movie-details').then(m => m.MovieDetailsComponent),
    title: 'DarkFlix | Detalles'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
