import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { getDevice } from "../utilities/device";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage {

    profileForm = this.fb.group({
      first: [''],
      last: [''],
      username: ['', [Validators.required, Validators.pattern("[a-zA-Z0-9]+[a-zA-Z0-9 ]+")]],
      password: [''],
      email: ['']
    });

    public device_mode: string;
    public authMode: string = "login";
    public currentUser: User;
    public error: string = "";
    public redirect_url: string = "/";

    constructor(public fb: FormBuilder, public apiService: ApiService, public userService: UserService, private route: ActivatedRoute, private platform: Platform) {
      this.device_mode = getDevice(this.platform);
      this.currentUser = this.userService.currentUserValue;
      this.authMode = "login";
      this.route.queryParams.subscribe(params => {
        if (params['mode'] == 'register') {
          this.authMode = 'register';
        } else {
          this.authMode = 'login';
        }
        if (params['redirect']) {
          this.redirect_url = params['redirect'];
        }
      });
    }

    register() {
      if (this.profileForm.status == 'VALID') {
        var username  = this.profileForm.controls.username.value;
        var password  = this.profileForm.controls.password.value;
        var first     = this.profileForm.controls.first.value;
        var last      = this.profileForm.controls.last.value;
        var email     = this.profileForm.controls.email.value;
        this.apiService.register(username, password, first, last, email).subscribe(
          data => {
            if (data.success) {
              var user      = new User();
              user.username = username;
              user.password = "";
              user.first    = first;
              user.last     = last;
              user.email    = email;
              this.login();
            } else {
              this.error = "Unknown error. Unable to register";
            }
          },
          error => {
            this.error = "Email or username already taken. Unable to register";
          }
        )

      }
    }

    logout() {
      this.userService.logout();
    }

    login() {
      if (this.profileForm.status == 'VALID') {
        var username  = this.profileForm.controls.username.value;
        var password  = this.profileForm.controls.password.value;
        this.apiService.login(username, password).subscribe(
          data => {
            if (data.success) {
              this.userService.login(data.user, this.redirect_url);
            } else {
              this.error = data.message;
            }
          },
          error => {
            this.error = "Invalid username/password.";
          }
        )
      }
    }

  }
