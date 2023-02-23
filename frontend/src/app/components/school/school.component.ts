import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.scss'],
})
export class SchoolComponent implements OnInit {

  public school = {};

  @Input()
  set getSchool(input) {
    this.school = input;
  }

  @Input() mode;

  constructor() { }

  ngOnInit() {}

}
