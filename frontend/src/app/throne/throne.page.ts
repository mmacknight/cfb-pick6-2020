import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Story } from '../models';
import { Router, ActivatedRoute, NavigationStart, RouterEvent } from '@angular/router';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { Platform } from '@ionic/angular';
import { getDevice } from "../utilities/device";

@Component({
  selector: 'app-throne',
  templateUrl: './throne.page.html',
  styleUrls: ['./throne.page.scss'],
})
export class ThronePage implements OnInit {

  device_mode: string;
  photoTimestamp = (new Date()).getTime();
  season: number = 2019;
  week: number = null;
  preview_url: string = "";
  old_story: Story = new Story();
  selectedImage: File = null;
  error:any = null;

  constructor(public router: Router, public route: ActivatedRoute, public apiService: ApiService, public userService: UserService, private platform: Platform) {
    this.device_mode = getDevice(this.platform);

    this.apiService.getTimeFrame().subscribe(
      data => {
        this.season = data.season;
        this.week = data.week;
      },
      error => { this.error = error }
    );
  }

  ionViewWillEnter() {
    this.getStory(this.week);
    this.apiService.getChampion(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        if (data.champion == undefined || data.champion.id != this.userService.currentUserValue.id) {
          this.router.navigate(['/league',parseInt(this.route.snapshot.paramMap.get('id'))]);
        }
      },
      error => { this.error = error }
    );
  }

  ngOnInit() {
  }

  getStory(week: number) {
    this.apiService.getStory(parseInt(this.route.snapshot.paramMap.get('id')), week, this.userService.currentUserValue.id).subscribe(
      data => {
        this.old_story = data.story;
      },
      error => { this.error = error }
    )
  }

  postStory(heading: string, story: string) {
    this.apiService.postStory(parseInt(this.route.snapshot.paramMap.get('id')), this.userService.currentUserValue.id, heading, story).subscribe(
      data => null,
      error => { this.error = error }
    );
  }

  fileUpload(event, preview) {
    if (event.target.files[0]) {
      preview.src = URL.createObjectURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
    }
  }

  photoUpload() {
    this.apiService.photoUpload(this.userService.currentUserValue.id,parseInt(this.route.snapshot.paramMap.get('id')),this.selectedImage).subscribe(
      data => {
        if (data.success) {
          this.photoTimestamp = (new Date()).getTime();
        } else {
          this.error = data.message
        }
      },
      error => { this.error = error }
    );
  }

  submit(heading, story) {
    if (this.selectedImage) {
      this.photoUpload();
    }
    if (heading != this.old_story.heading || story != this.old_story.story) {
      this.postStory(heading, story);
    }
  }

  cancel(preview, heading, story) {
    this.selectedImage = null;
    preview.src = "";
    heading.value = this.old_story.heading;
    story.value = this.old_story.story;
  }

}
