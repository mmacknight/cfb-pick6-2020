import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
})
export class ScoreComponent implements OnInit {

  public game = {shortDetail: '', away_school: '', a_p: '', a_s: '', a_t: '', home_school: '', h_p: '', h_s: '', h_t: ''};
  public school = {};
  public chart = {school_id: 0, percent: 0, color: 'transparent', color2: 'transparent', color3: 'transparent'};
  public good: number = 0;
  public mini: boolean = false;
  public myteam: boolean = false;

  @Input()
  set inp(input) {
    this.game = input[0];
    this.school = input[1];
    this.good = input[2];
    this.mini = input[3];
    this.myteam = input[4];
    if ( this.game ){
      if (this.good == this.game['home']) {
        this.chart = {school_id: this.game['home'], percent: this.game['home_percentage'], color: this.game['h_p'], color2: this.game['h_s'], color3: this.game['h_t']};
      }
      if (this.good == this.game['away']) {
        this.chart = {school_id: this.game['away'], percent: this.game['away_percentage'], color: this.game['a_p'], color2: this.game['a_s'], color3: this.game['a_t']};
      }
    }
  }

  constructor() { }

  ngOnInit() {}

}
