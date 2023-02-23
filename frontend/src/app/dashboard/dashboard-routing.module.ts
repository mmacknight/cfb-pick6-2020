import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardPage } from './dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children: [
      {
        path: 'league/:id',
        loadChildren: () =>
          import('../league/league.module').then(m => m.LeaguePageModule)
      },
      {
        path: 'league_settings/:id',
        loadChildren: () =>
          import('../league-settings/league-settings.module').then(m => m.LeagueSettingsPageModule)
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule {}
