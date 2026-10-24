import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

export function authGuard(): boolean {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
}

export function redirectIfAuthenticated(): boolean {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
}

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login.component').then(m => m.LoginComponent),
    canActivate: [redirectIfAuthenticated]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/scenarios/components/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clients',
    loadComponent: () => import('./features/clients/components/client-list.component').then(m => m.ClientListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clients/new',
    loadComponent: () => import('./features/clients/components/client-form.component').then(m => m.ClientFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clients/:id',
    loadComponent: () => import('./features/clients/components/client-detail.component').then(m => m.ClientDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clients/:id/edit',
    loadComponent: () => import('./features/clients/components/client-form.component').then(m => m.ClientFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'safety-cards',
    loadComponent: () => import('./features/safety-cards/components/card-list.component').then(m => m.CardListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'safety-cards/new',
    loadComponent: () => import('./features/safety-cards/components/card-form.component').then(m => m.CardFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'safety-cards/:id/edit',
    loadComponent: () => import('./features/safety-cards/components/card-form.component').then(m => m.CardFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'import',
    loadComponent: () => import('./features/import/components/import.component').then(m => m.ImportComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/components/product-list.component').then(m => m.ProductListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'scenarios',
    loadComponent: () => import('./features/scenarios/components/scenarios.component').then(m => m.ScenariosComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
