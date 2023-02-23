import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-school-alt',
  templateUrl: './school-alt.component.html',
  styleUrls: ['./school-alt.component.scss'],
})
export class SchoolAltComponent implements OnInit {

  public school = {primary_color: '', text_color: '', secondary_color: ''};
  public number: string = "0";
  public mini: boolean = false;

  @Input()
  set getSchool(input) {
    this.school = input;
  }

  @Input()
  set getNumber(input) {
    this.number = input;
  }

  @Input()
  set getMini(input) {
    this.mini = input;
  }

  constructor() { }

  ngOnInit() {}

}
