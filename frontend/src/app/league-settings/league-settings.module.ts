import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule }   from '@angular/forms';
import { ComponentsModule } from '../components.module';

import { LeagueSettingsPage } from './league-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ComponentsModule,
    RouterModule.forChild([{ path: '', component: LeagueSettingsPage }])
  ],
  declarations: [
    LeagueSettingsPage
  ]
})
export class LeagueSettingsPageModule {}
