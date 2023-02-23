import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from "./services/auth-guard.service";

const routes: Routes = [
  {
    path: 'supplemental/:id',
    loadChildren: () => import('./supplemental/supplemental.module').then( m => m.SupplementalPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'draft/:id',
    loadChildren: () => import('./draft/draft.module').then( m => m.DraftPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthPageModule)
  },
  {
    path: 'create',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./create/create.module').then(m => m.CreatePageModule)
      }
    ]
  },
  {
    path: 'league/:id',
    loadChildren: () =>
      import('./league/league.module').then(m => m.LeaguePageModule)
  },
  {
    path: 'settings/:id',
    loadChildren: () =>
      import('./league-settings/league-settings.module').then(m => m.LeagueSettingsPageModule)
  },
  {
    path: 'profile',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./profile/profile.module').then(m => m.ProfilePageModule)
      }
    ]
  },
  {
    path: 'author',
    loadChildren: () => import('./author/author.module').then( m => m.AuthorPageModule)
  },
  {
    path: 'article/:id',
    loadChildren: () => import('./article/article.module').then( m => m.ArticlePageModule)
  },
  {
    path: 'throne/:id',
    loadChildren: () => import('./throne/throne.module').then( m => m.ThronePageModule)
  },
  {
    path: '',
    loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: '*',
    loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
