import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-conference-filter',
  templateUrl: './conference-filter.component.html',
  styleUrls: ['./conference-filter.component.scss'],
})
export class ConferenceFilterComponent implements OnInit {

  public conf = ["ACC","American","BIG 12","BIG TEN","C-USA","Independent","MAC","Mountain West","PAC-12","SEC","Sun Belt"];

  constructor( public popoverController: PopoverController, public navParams: NavParams) {}

  async close(filter) {
    await this.popoverController.dismiss(filter);
  }

  ngOnInit() {}



}
