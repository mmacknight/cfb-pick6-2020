import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HideHeaderDirective } from './directives/hide-header.directive';
import { DomChangeDirective } from './directives/dom-change.directive';

@NgModule({
  declarations: [
    HideHeaderDirective,
    DomChangeDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HideHeaderDirective,
    DomChangeDirective
  ]
})
export class DirectivesModule { }
