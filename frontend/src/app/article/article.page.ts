import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Article } from "../models";
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { getDevice } from "../utilities/device";

@Component({
  selector: 'app-article',
  templateUrl: './article.page.html',
  styleUrls: ['./article.page.scss'],
})
export class ArticlePage implements OnInit {

  public article: Article = null;
  public device_mode: string = null;
  public schools:any = {};
  public error: any = null

  constructor(private router: Router, public route: ActivatedRoute, private apiService: ApiService, private sanitizer: DomSanitizer, public platform: Platform) {
    this.device_mode = getDevice(this.platform);
    this.apiService.getArticleByID(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        if (data.success) {
          const article: Article = data.article;
          if (this.device_mode == 'phone') {
            article.content = article.content.split("width=\"420\"").join("width=\""+this.platform.width()+"\"");
            article.content = article.content.split("height=\"315\"").join("height=\""+9/16*this.platform.width()+"\"");
          } else {
            article.content = article.content.split("width=\"420\"").join("width=\""+0.6*this.platform.width()+"\"");
            article.content = article.content.split("height=\"315\"").join("height=\""+9/16*0.6*this.platform.width()+"\"");
          }
          article.content = this.sanitizer.bypassSecurityTrustHtml(article.content);
          this.article = article;
        } else {
          this.error = data.message;
        }
      },
      error => {
        this.error = error
      }
    );
    this.apiService.getSchoolColors().subscribe(
      data => {
        for (let school of data['schools']) {
            this.schools[school['id']] = school;
        }
        this.powerRankings();
      },
      error => {
        this.error = error
      }
    );
  }

  ngOnInit() {
  }
  
  powerRankings() {
    const collection: any = document.getElementsByClassName('school-ranking');
    for (let school of collection) {
      school['style']['background'] = this.schools[school.id]['primary_color'];
      school['style']['color'] = this.schools[school.id]['text_color'];
    };
  }

  loadTweets() {
    window['twttr']['widgets']['load']();
  }

}
