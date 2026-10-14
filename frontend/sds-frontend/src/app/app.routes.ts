import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/scenarios/components/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'clients',
    loadComponent: () => import('./features/clients/components/client-list.component').then(m => m.ClientListComponent)
  },
  {
    path: 'clients/new',
    loadComponent: () => import('./features/clients/components/client-form.component').then(m => m.ClientFormComponent)
  },
  {
    path: 'clients/:id',
    loadComponent: () => import('./features/clients/components/client-detail.component').then(m => m.ClientDetailComponent)
  },
  {
    path: 'clients/:id/edit',
    loadComponent: () => import('./features/clients/components/client-form.component').then(m => m.ClientFormComponent)
  },
  {
    path: 'safety-cards',
    loadComponent: () => import('./features/safety-cards/components/card-list.component').then(m => m.CardListComponent)
  },
  {
    path: 'safety-cards/new',
    loadComponent: () => import('./features/safety-cards/components/card-form.component').then(m => m.CardFormComponent)
  },
  {
    path: 'safety-cards/:id/edit',
    loadComponent: () => import('./features/safety-cards/components/card-form.component').then(m => m.CardFormComponent)
  },
  {
    path: 'import',
    loadComponent: () => import('./features/import/components/import.component').then(m => m.ImportComponent)
  },
  {
    path: 'scenarios',
    loadComponent: () => import('./features/scenarios/components/scenarios.component').then(m => m.ScenariosComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
