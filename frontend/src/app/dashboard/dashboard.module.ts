import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardPage } from './dashboard.page';
import { ComponentsModule } from '../components.module';
import { DirectivesModule } from '../directives.module';
import { ContactComponent } from '../components/contact/contact.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    DirectivesModule,
    RouterModule.forChild([{ path: '', component: DashboardPage }])
  ],
  declarations: [
    DashboardPage,
    ContactComponent
  ]
})
export class DashboardPageModule {}
