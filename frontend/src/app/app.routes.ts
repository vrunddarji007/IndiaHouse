import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'properties',
    loadComponent: () => import('./pages/properties/properties-list.component').then(m => m.PropertiesListComponent)
  },
  {
    path: 'properties/post',
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['agent', 'host'] },
    loadComponent: () => import('./pages/properties/post-property.component').then(m => m.PostPropertyComponent)
  },
  {
    path: 'properties/manage/:id',
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['agent', 'host'] },
    loadComponent: () => import('./pages/properties/property-manage.component').then(m => m.PropertyManageComponent)
  },
  {
    path: 'properties/:slug',
    loadComponent: () => import('./pages/properties/property-detail.component').then(m => m.PropertyDetailComponent)
  },
  {
    path: 'favorites',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent)
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/messages/messages.component').then(m => m.MessagesComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile-view/profile-view.component').then(m => m.ProfileViewComponent)
  },
  {
    path: 'profile/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/complete-profile/complete-profile.component').then(m => m.CompleteProfileComponent)
  },
  {
    path: 'profile/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile-view/profile-view.component').then(m => m.ProfileViewComponent)
  },
  {
    path: 'host-dashboard',
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['host'] },
    loadComponent: () => import('./pages/host-dashboard/host-dashboard.component').then(m => m.HostDashboardComponent)
  },
  { path: '**', redirectTo: '' }
];
