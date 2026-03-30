import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'participantes', loadComponent: () => import('./pages/participantes/participantes.component').then(m => m.ParticipantesComponent) },
      { path: 'tabelas', loadComponent: () => import('./pages/tabelas/tabelas.component').then(m => m.TabelasComponent) },
      { path: 'meu-perfil', loadComponent: () => import('./pages/meu-perfil/meu-perfil.component').then(m => m.MeuPerfilComponent) },
      { path: 'admin/game', loadComponent: () => import('./pages/admin/game-control/game-control.component').then(m => m.GameControlComponent), canActivate: [adminGuard] },
      { path: 'admin/users', loadComponent: () => import('./pages/admin/users/admin-users.component').then(m => m.AdminUsersComponent), canActivate: [adminGuard] },
      { path: '', redirectTo: 'participantes', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
