import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule }   from '@angular/forms';
import { ComponentsModule } from '../components.module';
import { DirectivesModule } from '../directives.module';

import { LeaguePage } from './league.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ComponentsModule,
    DirectivesModule,
    RouterModule.forChild([{ path: '', component: LeaguePage }])
  ],
  declarations: [
    LeaguePage
  ]
})
export class LeaguePageModule {}
