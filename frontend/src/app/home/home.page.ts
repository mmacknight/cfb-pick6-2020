import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { User } from '../models/user';
import { Platform } from '@ionic/angular';
import { getDevice } from "../utilities/device";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  demo_team = {team_name: '', user_id: null, first: '', last: ''};
  demo_admin: User = new User();
  demo_league = {name: ''};
  public teams = [];
  public schools = {};
  public id: number = null;
  current_week: number = 4;
  league = {name: null, league_admin: null, league_info: null, team_count: null, first: null, last: null};
  selectedTeam: number = -1;
  selectedMessage: number = -1;
  games = {};
  weeks = [];
  invite = { username: '', first: '', last: '', name: ''};
  profileForm = this.fb.group({
    first: [''],
    last: [''],
    username: [''],
    password: [''],
    email: ['']
  });
  device_mode: string = '';
  error:any = null;

  constructor(private router: Router, public fb: FormBuilder, private apiService: ApiService, public platform: Platform) {
    this.demo_admin.first = 'Hirk';
    this.demo_admin.last = 'Kerbstreit';
    this.demo_admin.username = 'hkerbstreit';
    this.demo_admin.email = 'notarealemail@gmail.com';
    this.demo_admin.password = 'password';
    this.demo_league.name = "CFB Fans";
    this.invite = {username: this.demo_admin.username, first: this.demo_admin.first, last: this.demo_admin.last, name: this.demo_league.name};

    this.getTeams();
    this.device_mode = getDevice(this.platform);
  }

  ngOnInit() {
  }

  authLink(query: string) {
    this.router.navigate(['/auth'], { queryParams: { mode: query} });
  }

  getTeams() {
    this.teams = [];
    this.schools = {};
    this.apiService.getLeagueTeams(55).subscribe(
      data => {
        if (data.success) {
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
    this.apiService.getLeagueTeamsSchools(55).subscribe(
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
          }
          this.teams.sort((a,b) => this.teamWins(b.user_id) - this.teamWins(a.user_id));
          this.demo_team = this.teams[0];
        } else {
          this.error = data.message
        }
      },
      error => {
        this.error = error
      }
    );
  }

  teamWins(user_id: number) {
    if (user_id in this.schools) {
      return this.schools[user_id].map(a => a.wins).reduce((a,b) => a+b);
    } else {
      return 0;
    }
  }

}
