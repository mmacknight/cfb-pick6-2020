import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components.module';
import { SupplementalPageRoutingModule } from './supplemental-routing.module';
import { SupplementalPage } from './supplemental.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    SupplementalPageRoutingModule
  ],
  declarations: [SupplementalPage]
})
export class SupplementalPageModule {}
