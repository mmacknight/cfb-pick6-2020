import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components.module';
import { DraftPageRoutingModule } from './draft-routing.module';
import { DraftPage } from './draft.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    DraftPageRoutingModule
  ],
  declarations: [DraftPage]
})
export class DraftPageModule {}
