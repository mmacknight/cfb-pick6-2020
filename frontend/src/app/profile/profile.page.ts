import { Component, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../models/user';
import { Invite } from '../models/invite';
import { Observable, BehaviorSubject } from 'rxjs';
import {
   debounceTime, distinctUntilChanged, switchMap, first
 } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { getDevice} from "../utilities/device";

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {

  profileForm = this.fb.group({
    first: [''],
    last: [''],
    username: [''],
    password: [''],
    email: ['']
  });

  currentUser: User = null;
  invites = [];
  invites$: Observable<Invite[]>;
  device_mode = "";
  edit: boolean = false;
  error: any = null;

  constructor(public fb: FormBuilder, public apiService: ApiService, public userService: UserService, public platform: Platform, public route: ActivatedRoute, public router: Router) {
    this.currentUser = this.userService.currentUserValue;
    this.getInvites();
    this.device_mode = getDevice(this.platform);
  }

  acceptInvite(league_id: number) {
    this.apiService.respondInvite(this.userService.currentUserValue.id, this.userService.currentUserValue.email, league_id, 1).subscribe(
      data => {
        if (data.success) {
          this.getInvites();
        } else {
          this.error = data.message;
        }
      },
      error => {
         this.error = error;
      }
    );
  }

  declineInvite(league_id: number) {
    this.apiService.respondInvite(this.userService.currentUserValue.id, this.userService.currentUserValue.email, league_id, 0).subscribe(
      data => {
        if (data.success) {
          this.getInvites();
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }

  getInvites() {
    if (this.userService.currentUserValue) {
      this.apiService.getInvites(this.userService.currentUserValue.email).subscribe(
        data => {
          if (data.success) {
            this.invites = data.invites;
          } else {
            this.error = data.message
          }
        },
        error => {
          this.error = error
        }
      );
    }
  }

  logout() {
    this.userService.logout();
  }

  @ViewChild("refresher", {static: false}) refresher;

  async refreshTeams(refresher) {
      await this.getInvites();
      this.refresher.complete();  // Works
  }

  trackByFunction(index, item) {
    if (!item) return null;
    return index;
  }

  toggleEdit() {
    this.edit = !this.edit;
  }

  submit(first, last, username, email) {
    this.apiService.updateProfile(first, last, username, email, this.userService.currentUserValue.id).subscribe(
      data => {
        this.toggleEdit();
        this.currentUser = data.user;
        this.userService.login(data.user, 'profile', false);
      },
      error => {
        this.error = error
      }
    );
  }
}
