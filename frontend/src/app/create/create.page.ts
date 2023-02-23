import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Validators, FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { League } from '../models/league';
import { Router } from '@angular/router';
import { getDevice } from "../utilities/device";
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-create',
  templateUrl: 'create.page.html',
  styleUrls: ['create.page.scss']
})
export class CreatePage {

  device_mode: string = "";
  currentUser: User;
  error:any = null;

  leagueForm = this.fb.group({
    name: [''],
    info: ['']
  });

  constructor(public apiService: ApiService, public userService: UserService, public fb: FormBuilder, public router: Router, public platform: Platform) {
    this.device_mode = getDevice(this.platform);
    this.currentUser = this.userService.currentUserValue;
  }

  createLeague() {
    this.apiService.createLeague(this.userService.currentUserValue.id, this.leagueForm.value.name, this.leagueForm.value.info).subscribe(
      data => {
        if (data.success) {
          this.router.navigate(['/league/',data.league_id]);
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    )
  }

}
