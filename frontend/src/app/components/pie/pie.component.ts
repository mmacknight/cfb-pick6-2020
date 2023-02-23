import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

export interface Item {
  name: string;
  value: number;
  abs: number;
};

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PieComponent implements OnInit {

  public mini: boolean = false;
  private drawn: boolean = false;

  public school_id: number = 0;
  public percent: number = 0;
  public color: string = 'transparent';
  public color2: string = 'transparent';
  public color3: string = 'transparent';

  radius: number;
  private arc: any;  private pie: any;  private slices: any;
  private svg: any;  private mainContainer: any;
  dataSource: Item[];

  @Input()
  set inp(input) {
    this.school_id = input[0];
    this.percent = Math.floor(input[1]);
    this.color = input[2];
    this.color2 = input[3];
    this.color3 = input[4];
    this.mini = input[5];
    this.draw_chart();
  }


  private setSVGDimensions() {
    this.radius = this.mini ? 40 : 46;
    this.svg.attr('width', 2 * this.radius).attr('height', 2 * this.radius);
    this.svg.select('g');
  }

  private draw() {
    this.setArcs();
    this.drawSlices();
  }

  private setArcs() {
    this.arc = d3.arc().outerRadius(this.radius).innerRadius(this.radius * .75);
  }

  private drawSlices() {
    this.slices = this.mainContainer.selectAll('path')
      .remove().exit()
      .data(this.pie(this.dataSource))
      .enter().append('g').append('path')
      .attr('d', this.arc);
    this.slices
      .attr('fill', (d, i) => i % 2  == 0?  this.color : '#E8E8E8');
  }




  private generateRandomValue(start: number, end: number) {
    return Math.ceil(Math.random() * (end - start) + start);
  }

  getData(): Item[] {
    const samples = [];
    samples.push({
      name: 'win',
      value: this.percent,
      abs: this.percent
    });
    samples.push({
      name: 'lose',
      value: 100-this.percent,
      abs: 100-this.percent
    });
    return samples;
  }

  constructor() {
  }

  ngOnInit() {
  }

  draw_chart() {
    this.dataSource = this.getData();
    this.svg = d3.select(`#pie${this.school_id}`).select('svg');
    this.setSVGDimensions();
    this.mainContainer = this.svg.append('g')
    .attr('transform', `translate(${this.radius},${this.radius})`);
    this.pie = d3.pie().sort(null).value((d: any) => d.abs);
    this.draw();
  }

  onDomChange($event) {
    if ($event.addedNodes[0].id == `pie${this.school_id}` && this.drawn == false) {
      this.drawn = true;
      this.draw_chart();
    }
  }
}
