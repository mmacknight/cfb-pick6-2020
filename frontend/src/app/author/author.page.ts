import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-author',
  templateUrl: './author.page.html',
  styleUrls: ['./author.page.scss'],
})
export class AuthorPage implements OnInit {


  public mode: number = 0;
  public selectedArticle = {id: null, title: '', content: '', tease: ''};
  public articles = [];
  public articleForm = this.fb.group({
    title: ['Sample Content'],
    tease: ['Sample tease for homepage'],
    content: ['<h1>Sample Heading</h1><h2>Sample Sub-Header</h2><p>Sample paragraph</p>']
  });
  public error: any = null;


  constructor( public fb: FormBuilder, private apiService: ApiService, public sanitizer: DomSanitizer) {
    this.getArticlesByAuthor();
  }

  ngOnInit() {
  }
  
  getArticlesByAuthor() {
    this.apiService.getArticlesByAuthor(1).subscribe(
      data => {
        if (data.success) {
          this.articles = data.articles;
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }

  postArticle() {
    this.apiService.postArticle(1,this.articleForm.controls.title.value, this.articleForm.controls.content.value, this.articleForm.controls.tease.value).subscribe(
      data => {
        if (data.success) {
          this.getArticlesByAuthor();
          this.selectedArticle = {id: null, title: '', content: '', tease: ''};
          this.cancel();
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }

  updateArticle() {
    this.apiService.updateArticle(this.selectedArticle.id,1,this.articleForm.controls.title.value, this.articleForm.controls.content.value, this.articleForm.controls.tease.value).subscribe(
      data => {
        if (data.success) {
          this.getArticlesByAuthor();
          this.selectedArticle = {id: null, title: '', content: '', tease: ''};
          this.cancel();
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }

  selectArticle(article) {
    this.selectedArticle = article;
  }

  toggleNew() {
    this.mode = 1;
    this.articleForm.controls.title.setValue('Sample Content');
    this.articleForm.controls.tease.setValue('Sample tease for homepage');
    this.articleForm.controls.content.setValue('<h1>Sample Heading</h1><h2>Sample Sub-Header</h2><p>Sample paragraph</p>');
  }

  toggleEdit(article) {
    this.mode = 2;
    this.selectedArticle = article;
    this.articleForm.controls.title.setValue(article.title);
    this.articleForm.controls.tease.setValue(article.tease);
    this.articleForm.controls.content.setValue(article.content);
  }

  cancel() {
    this.mode = 0;
  }
}
