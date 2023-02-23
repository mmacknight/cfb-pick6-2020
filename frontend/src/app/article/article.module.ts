import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular';
import { DirectivesModule } from '../directives.module';

import { ArticlePage } from './article.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DirectivesModule,
    RouterModule.forChild([{ path: '', component: ArticlePage }])
  ],
  declarations: [ArticlePage]
})
export class ArticlePageModule {}
