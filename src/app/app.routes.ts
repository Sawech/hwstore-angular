import { Routes } from '@angular/router';
import { adminAuthGuard } from './admin/core/admin-auth.guard';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
    title: 'HWstore | Excellence en Solutions Informatiques',
  },
  {
    path: 'configurateur-pc',
    loadComponent: () =>
      import('./pages/configurateur/configurateur').then((m) => m.ConfigurateurComponent),
    title: 'Configurateur PC | HWstore',
  },
  // {
  //   path: 'builder',
  //   loadChildren: () => import('./features/builder/builder.routes').then((m) => m.BUILDER_ROUTES),
  // },
  {
    path: 'composants/:id',
    loadComponent: () =>
      import('./pages/composant-detail/composant-detail').then((m) => m.ComposantDetailComponent),
    title: 'Détail Composant | HWstore',
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories').then((m) => m.CategoriesComponent),
    title: 'Nos Catégories | HWstore',
  },
  {
    path: 'categories/:slug',
    loadComponent: () =>
      import('./pages/sous-categories/sous-categories').then((m) => m.SousCategoriesComponent),
    title: 'Sous Catégories | HWstore',
  },
  {
    path: 'sous-categories',
    loadComponent: () =>
      import('./pages/sous-categories/sous-categories').then((m) => m.SousCategoriesComponent),
    title: 'Sous Catégories | HWstore',
  },
  {
    path: 'sous-categories/:subcategoryId/composants',
    loadComponent: () => import('./pages/composants/composants').then((m) => m.ComposantsComponent),
    title: 'Composants | HWstore',
  },
  {
    path: 'panier',
    loadComponent: () => import('./pages/panier/panier').then((m) => m.PanierComponent),
    canActivate: [authGuard],
    title: 'Mon Panier | HWstore',
  },

  {
    path: 'success/:cartId',
    loadComponent: () =>
      import('./pages/panier/payment-success/payment-success').then(
        (m) => m.PaymentSuccessComponent,
      ),
    canActivate: [authGuard],
    title: 'Paiement Réussi | HWstore',
  },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
    title: 'Se Connecter | HWstore',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.RegisterComponent),
    title: 'Créer un Compte | HWstore',
  },
  {
    path: 'compte',
    loadComponent: () =>
      import('./features/auth/compte/mon-compte').then((m) => m.MonCompteComponent),
    canActivate: [authGuard],
    title: 'Mon Compte | HWstore',
  },
  {
    path: 'commandes',
    loadComponent: () =>
      import('./pages/panier/commandes/commandes').then((m) => m.CommandesComponent),
    canActivate: [authGuard],
    title: 'Mes Commandes | HWstore',
  },

  {
    path: 'admin/login',
    loadComponent: () => import('./admin/login/login').then((m) => m.AdminLoginComponent),
    title: 'Connexion Admin | HWstore',
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/layout/layout').then((m) => m.AdminLayoutComponent),
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard').then((m) => m.DashBoardComponent),
        title: 'Tableau de Bord | HWstore Admin',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./admin/categories/categories').then((m) => m.AdminCategoriesComponent),
        title: 'Catégories | HWstore Admin',
      },
      {
        path: 'composants',
        loadComponent: () =>
          import('./admin/composants/composants').then((m) => m.AdminComposantsComponent),
        title: 'Composants | HWstore Admin',
      },
      {
        path: 'composants/new',
        loadComponent: () =>
          import('./admin/composants/nouveau-composant/nouveau-composant').then(
            (m) => m.AdminNouveauComposantComponent,
          ),
        title: 'Nouveau Composant | HWstore Admin',
      },
      {
        path: 'composants/new/:id',
        loadComponent: () =>
          import('./admin/composants/nouveau-composant/nouveau-composant').then(
            (m) => m.AdminNouveauComposantComponent,
          ),
        title: 'Nouveau Composant | HWstore Admin',
      },
      {
        path: 'commandes',
        loadComponent: () =>
          import('./admin/commandes/commandes').then((m) => m.AdminCommandesComponent),
        title: 'Commandes | HWstore Admin',
      },
      {
        path: 'sous-categories',
        loadComponent: () =>
          import('./admin/sous-categories/sous-categories').then(
            (m) => m.AdminSousCategoriesComponent,
          ),
        title: 'Sous-Catégories | HWstore Admin',
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
