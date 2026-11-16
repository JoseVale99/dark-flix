import { Routes } from '@angular/router';
import { profileGuard } from '@core/guards/profile.guard';

export const routes: Routes = [
  {
    path: 'profiles',
    loadComponent: () => import('./features/profiles/profiles-view').then(m => m.ProfilesViewComponent),
    title: 'routes.profiles'
  },
  {
    path: '',
    canActivate: [profileGuard],
    loadComponent: () => import('./features/browse/browse-home').then(m => m.BrowseHomeComponent),
    title: 'routes.home'
  },
  {
    path: 'search',
    canActivate: [profileGuard],
    loadComponent: () => import('./features/search/search-view').then(m => m.SearchViewComponent),
    title: 'routes.search'
  },
  {
    path: 'mi-lista',
    canActivate: [profileGuard],
    loadComponent: () => import('./features/my-list/my-list-view').then(m => m.MyListViewComponent),
    title: 'routes.myList'
  },
  {
    path: ':catalogType',
    canActivate: [profileGuard],
    loadComponent: () => import('./features/catalog/catalog-view').then(m => m.CatalogViewComponent),
    title: 'routes.catalog'
  },
  {
    path: ':typeSlug/:slug',
    canActivate: [profileGuard],
    loadComponent: () => import('./features/movie/movie-details').then(m => m.MovieDetailsComponent),
    title: 'routes.details'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
