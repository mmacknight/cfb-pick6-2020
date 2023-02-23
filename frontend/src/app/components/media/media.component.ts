import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
})
export class MediaComponent implements OnInit {

  public articles = [];
  public device_mode: string = '';

  @Input()
  set articles_input(input) {
    this.articles = input;
  }

  @Input()
  set device_input(input) {
    this.device_mode = input;
  }

  constructor(public router: Router) { }

  ngOnInit() {}

}
