import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SupplementalPage } from './supplemental.page';

const routes: Routes = [
  {
    path: '',
    component: SupplementalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupplementalPageRoutingModule {}
