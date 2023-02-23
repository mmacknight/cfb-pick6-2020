import { Directive, Input, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[hide-header]',
  host: {
    '(ionScroll)': 'onContentScroll($event)'
  }
})
export class HideHeaderDirective {

  @Input("header") header: any;
  headerHeight: number = 0;
  vis: boolean = true;
  constructor(public element: ElementRef, public renderer: Renderer) {
  }

  onContentScroll(event) {
    if (event.detail.deltaY > 44 && event.detail.velocityY > 0) {
      this.vis = false;
      this.renderer.setElementStyle(this.header, "top", " -44px");
    } else if ((event.detail.velocityY < -0.1 || event.detail.deltaY < -22 || event.detail.scrollTop < 44)) {
      this.vis = true;
      this.renderer.setElementStyle(this.header, "top", "0px");
    }
  }

  ngAfterViewInit() {
    this.header = this.header.el;
    this.renderer.setElementStyle(this.header, "webkitTransition", "top 300ms");
  }

}
