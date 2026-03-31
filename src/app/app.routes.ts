import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    // MCP Best Practice: Implement lazy loading for feature routes
    loadComponent: () => import('./features/browse/browse-home').then(m => m.BrowseHomeComponent),
    title: 'DarkFlix | Inicio'
  },
  {
    path: '**',
    redirectTo: '' // Fallback route
  }
];
