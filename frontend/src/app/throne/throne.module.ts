import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThronePageRoutingModule } from './throne-routing.module';

import { ThronePage } from './throne.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThronePageRoutingModule
  ],
  declarations: [ThronePage]
})
export class ThronePageModule {}
