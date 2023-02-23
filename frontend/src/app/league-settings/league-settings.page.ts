import { Component, ViewChild, ElementRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import {
   debounceTime, distinctUntilChanged, switchMap, first
 } from 'rxjs/operators';
 import { Platform } from '@ionic/angular';
 import { getDevice } from "../utilities/device";

@Component({
  selector: 'app-league-settings',
  templateUrl: './league-settings.page.html',
  styleUrls: ['./league-settings.page.scss'],
})
export class LeagueSettingsPage {

  seg: string = "info";
  imagePreview: any;
  photoTimestamp = (new Date()).getTime();
  selectedImage: File = null;
  teams = [];
  league = {name: '' , league_admin: '', league_info: '', current_pick: null, draft_order: null, team_count: null, first: '', last: ''};
  schools = {};
  all_schools = {};
  all_schools_array = [];
  invites = [];
  id: number = null;
  editLeague: boolean = false;
  editTeams: boolean = false;
  selectedTeam = { status: false, schools: [], team: null};
  device_mode: string = null;
  leagueForm = this.fb.group({
    name: [''],
    info: ['']
  });
  searchTermsUsers = new BehaviorSubject<string>('');
  error:any = {}
  searchResults$: Observable<any[]> = this.searchTermsUsers.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term: string) => this.apiService.searchUsers(term,this.userService.currentUserValue.id,parseInt(this.route.snapshot.paramMap.get('id'))))
  )

  constructor(public apiService: ApiService, public userService: UserService, public router: Router, public route: ActivatedRoute, public fb: FormBuilder, private alertController: AlertController, public platform: Platform) {
    this.device_mode = getDevice(this.platform);
    this.getLeagueInfo();
  }

  ionViewWillEnter() {
    this.selectedTeam.status = false;;
    this.selectedTeam.schools = [];
    this.selectedTeam.team = null;
    this.getLeagueInfo();
    this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.getTeams();
    this.getLeagueInvites();
  }

  async getTeams() {
    this.teams = [];
    this.schools = {};
    await this.getAllSchools();
    this.apiService.getLeagueTeams(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        if (data.success) {
          this.teams = [];
          for (var i in data.teams) {
            this.teams.push(data.teams[i]);
          }
          this.getSchools();
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }

  getSchools() {
    this.apiService.getLeagueTeamsSchools(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        if (data.success) {
          for (var i in data.schools) {
            var team = data.schools[i];
            if (team.user_id in this.schools) {
              this.schools[team.user_id].push(team);
            } else {
              this.schools[team.user_id] = [];
              this.schools[team.user_id].push(team);
            }
            this.all_schools[team.school_id]["avail"] = 0;
          }
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }

  getAllSchools() {
    this.apiService.getSchools().subscribe(
      data => {
        if (data.success) {
          this.all_schools_array = [];
          for (var i in data.schools) {
            var school = data.schools[i];
            this.all_schools[school.id] = school;
            this.all_schools[school.id]["avail"] = 1;
            this.all_schools_array.push(school);
          }

        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    )
  }

  selectTeam(team) {
    this.selectedTeam.status = true;
    this.selectedTeam.team = team;
    if (team.user_id in this.schools) {
      this.selectedTeam.schools = this.schools[team.user_id];
    } else {
      this.selectedTeam.schools = [];
    }
  }

  resetValues() {
    this.getTeams();
    if (this.selectedTeam.status) {
      this.apiService.changeSchools(this.selectedTeam.team.user_id,this.selectedTeam.team.league_id,this.getSchoolId(this.selectedTeam.schools)).subscribe(
        data => null,
        error => this.error = error
      )
    }
    this.editTeams = false;
    this.selectedTeam.status = false;
    this.selectedTeam.team = {};
    this.selectedTeam.schools = [];
  }

  getSchoolId(schools) {
    return schools.map(x => x.id);
  }

  toggleEditTeams() {
    this.editTeams = !this.editTeams;
  }

  toggleEditLeague() {
    this.editLeague = !this.editLeague;
  }

  addSchool(school) {
    if (this.selectedTeam.schools.length < 6) {
      this.selectedTeam.schools.push(school);
      this.all_schools[school.id]["avail"] = 0;
    }
  }

  removeSchool(index: number) {
    this.all_schools[this.selectedTeam.schools[index].id]["avail"] = 1;
    this.selectedTeam.schools.splice(index,1);
  }

  search_users(name) {
    this.searchTermsUsers.next(name);
  }

  getLeagueInfo() {
    this.apiService.getLeagueInfo(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        if (this.userService.currentUserValue.id != data.league.league_admin) {
          this.router.navigate(['/league',parseInt(this.route.snapshot.paramMap.get('id'))]);
        }
        this.league = data.league;
        this.leagueForm['name'].setValue(data.league.name);
        this.leagueForm['info'].setValue(data.league.league_info);
      },
      error => {
        this.error = error
      }
    );
  }

  getLeagueInvites() {
    this.apiService.getLeagueInvites(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        this.invites = data.invites;
      },
      error => {
        this.error = error
      }
    );
  }

  sendInvite(username: string, search) {
    this.apiService.addInvite(username, parseInt(this.route.snapshot.paramMap.get('id')), `${this.league.first} ${this.league.last}`, this.league.name).subscribe(
      data => {
        if (data.success) {
          search.value = '';
          this.getLeagueInvites();
        } else {
          this.error = `Error sending invite to ${username}`;
        }
      },
      error => {
        this.error = error
      }
    );
  }

  deleteInvite(user_id: number, username: string) {
    this.apiService.respondInvite(user_id, username, parseInt(this.route.snapshot.paramMap.get('id')), 0).subscribe(
      data => {
        if (data.success) {
          this.getLeagueInvites();
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }

  updateLeague(photo) {
    if (this.selectedImage) {
      this.photoUpload();
    }
    if (this.leagueForm.value.name && this.leagueForm.value.info) {
      this.apiService.updateLeague(parseInt(this.route.snapshot.paramMap.get('id')), this.leagueForm.value.name, this.leagueForm.value.info).subscribe(
        data => {
          if (data.success) {
            this.getLeagueInfo();
            this.toggleEditLeague()
          } else {
            this.error = data.message
          }
        },
        error => {
          this.error = error
        }
      )
    } else {
      this.toggleEditLeague();
    }
  }

  deleteTeam(user_id: number) {
    this.apiService.deleteTeam(user_id,parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        if (data.success) {
          this.getTeams();
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
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
      error => {
        this.error = error
      }
    );
  }

  fileUpload(event) {
    this.selectedImage = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(this.selectedImage);
  }

  createDraft() {
    this.apiService.createDraft(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => null,
      error => {
        this.error = error
      }
    )
  }

  draftLink() {
    this.router.navigate(['/draft',parseInt(this.route.snapshot.paramMap.get('id'))])
  }

  loadDraft() {
    this.apiService.loadDraft(parseInt(this.route.snapshot.paramMap.get('id'))).subscribe(
      data => {
        if (data.success) {
          this.getTeams();
        }
      },
      error => {
        this.error = error
      }
    );
  }

  @ViewChild("refresher", {static: false}) refresher;

  async refreshTeams(refresher) {
      await this.getTeams();
      this.refresher.complete();  // Works
  }

  async removeAlert(user_id: number, team_name: string) {
  const alert = await this.alertController.create({
    header: 'Are you sure you want to remove this team?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: (element) => {
          console.log('Confirm Cancel:');
        }
      }, {
        text: 'Remove',
        cssClass: 'remove-alert',
        handler: () => {
          this.deleteTeam(user_id);
        }
      }
    ]
  });

  await alert.present();
}
}
