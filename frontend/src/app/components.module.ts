import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolComponent } from './components/school/school.component';
import { SchoolAltComponent } from './components/school-alt/school-alt.component';
import { ScoreComponent } from './components/score/score.component';
import { ConferenceFilterComponent } from './components/conference-filter/conference-filter.component';
import { DraftSortComponent } from './components/draft-sort/draft-sort.component';
import { SupplementalModalComponent } from './components/supplemental-modal/supplemental-modal.component';
import { AboutComponent } from './components/about/about.component';
import { MediaComponent } from './components/media/media.component';
import { TickerComponent } from './components/ticker/ticker.component';
import { PieComponent } from './components/pie/pie.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from './directives.module';
import { RouterModule } from '@angular/router';
import { SchoolSortPipe } from './pipes/school-sort.pipe';

@NgModule({
  declarations: [
    SchoolComponent,
    SchoolAltComponent,
    ScoreComponent,
    ConferenceFilterComponent,
    DraftSortComponent,
    TickerComponent,
    PieComponent,
    AboutComponent,
    MediaComponent,
    SupplementalModalComponent,
    SchoolSortPipe
  ],
  entryComponents: [
    SchoolComponent,
    SchoolAltComponent,
    ScoreComponent,
    ConferenceFilterComponent,
    DraftSortComponent,
    TickerComponent,
    PieComponent,
    AboutComponent,
    MediaComponent,
    SupplementalModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    DirectivesModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    SchoolComponent,
    SchoolAltComponent,
    ScoreComponent,
    ConferenceFilterComponent,
    TickerComponent,
    DraftSortComponent,
    PieComponent,
    AboutComponent,
    MediaComponent,
    SupplementalModalComponent,
    SchoolSortPipe
  ]
})
export class ComponentsModule { }
