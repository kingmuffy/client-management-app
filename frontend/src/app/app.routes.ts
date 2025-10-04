import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'clients',
    loadComponent: () =>
      import('./features/clients/clients.component').then(
        (m) => m.ClientsComponent
      ),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'drafts',
    loadComponent: () =>
      import('./features/drafts/drafts.component').then(
        (m) => m.DraftsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'logs',
    loadComponent: () =>
      import('./features/logs/logs.component').then((m) => m.LogsComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
];
