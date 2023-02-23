import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThronePage } from './throne.page';

const routes: Routes = [
  {
    path: '',
    component: ThronePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThronePageRoutingModule {}
