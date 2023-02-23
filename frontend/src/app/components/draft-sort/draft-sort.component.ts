import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-draft-sort',
  templateUrl: './draft-sort.component.html',
  styleUrls: ['./draft-sort.component.scss'],
})
export class DraftSortComponent implements OnInit {

  constructor( public popoverController: PopoverController, public navParams: NavParams) {}

  async close(draft_sort) {
    await this.popoverController.dismiss(draft_sort);
  }

  ngOnInit() {}



}
